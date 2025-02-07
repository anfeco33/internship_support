const Comment = require('../models/comments');
const User = require('../models/users');
const Company = require('../models/companies')
const Internship = require('../models/internships');
const Application = require('../models/applications');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const mailer = require('../utils/mailer')

var { authentication, isAdmin } = require('../middleware/authentication');
const { validate } = require('./validator');

const { validationResult } = require('express-validator');
const fs = require('fs');

class BusinessController {
  async getBusinessProfilesForAdmin(req, res, next) {
    try {
      const businesses = await Company.find({}).select('name industry size updatedAt isVerified');
      console.log("business list: ", businesses);
      return businesses;
    } catch (error) {
      console.error('Error fetching business profiles:', error);
      throw error;
    }
  }

  async toggleCompanyVerification(req, res) {
    try {
      const { companyId } = req.params; 
      const { isVerified } = req.body;
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'error', message: 'Company not found' });
      }
  
      // Cập nhật verify
      company.isVerified = isVerified;
      await company.save();
  
      res.status(200).json({
        status: 'success',
        message: `Company's profile has been ${isVerified ? 'verified' : 'unverified'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating company verification status:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }
  
  async lockCompanyProfile(req, res) {
    try {
      const { companyId } = req.params;
      const { isLocked } = req.body;
  
      // Tìm công ty
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'error', message: 'Company not found' });
      }
  
      company.isLocked = isLocked;
      await company.save();
  
      // Cập nhật thông báo `isViewedByCompany` cho từng đại diện
      const representatives = await User.find({ _id: { $in: company.representativeIds } }).select('isViewedByCompany');
      console.log("representatives lock com: ", representatives);
      // Đặt lại `isViewedByCompany` thành `false` cho tất cả các đại diện của công ty
      await Promise.all(
        representatives.map(async (user) => {
          if (user.isViewedByCompany) {
            user.isViewedByCompany = false; 
            await user.save();
          }
        })
      );
  
      const message = isLocked
        ? `Company profile has been locked successfully.`
        : `Company profile has been unlocked successfully.`;
  
      res.status(200).json({
        status: 'success',
        message,
      });
    } catch (error) {
      console.error('Error toggling company lock status:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // async get_list_business(filter = {}) {
  //   try {
  //     // show công ty có hồ sơ cập nhật, không khóa
  //     filter.isProfileUpdated = true;
  //     filter.isLocked = false;
  
  //     const businesses = await Company.find(filter)
  //       .select('name images averageRating address isVerified industry size');
  
  //     return businesses;
  //   } catch (error) {
  //     console.error('Error fetching business list:', error);
  //   }
  // }
  async get_list_business(filter = {}, page = 1, limit = 3) {
    try {
      // show công ty có hồ sơ cập nhật, không khóa
      filter.isProfileUpdated = true;
      filter.isLocked = false;
  
      const skip = (page - 1) * limit;
      const totalCompanies = await Company.countDocuments(filter);
      const businesses = await Company.find(filter)
        .select('name images averageRating address isVerified industry size')
        .skip(skip)
        .limit(limit);
  
      return {
        businesses,
        totalCompanies,
        totalPages: Math.ceil(totalCompanies / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching business list:', error);
    }
  }
  
  async get_top_supportive_companies() {
    try {
      // const topCompanies = await Company.find({
      //   isProfileUpdated: true,
      //   isVerified: true,
      //   isLocked: false, // công ty không bị khóa
      // })
      //   .sort({ averageRating: -1 }) // Sort by average rating in descending order
      //   .limit(3)
      //   .select('name images averageRating address isVerified industry size');
      const topCompanies = await Company.aggregate([
      {
        $match: {
          isProfileUpdated: true,
          isVerified: true,
          isLocked: false, // công ty không bị khóa
        }
      },
      {
        $addFields: {
          criteriaAverage: {
            $avg: [
              "$ratings.workEnvironment",
              "$ratings.trainingSupport",
              "$ratings.learningOpportunities",
              "$ratings.benefits"
            ]
          },
          overallAverage: {
            $avg: [
              "$ratings.workEnvironment",
              "$ratings.trainingSupport",
              "$ratings.learningOpportunities",
              "$ratings.benefits",
              "$averageRating"
            ]
          }
        }
      },
      {
        $sort: {
          overallAverage: -1 // tính theo điểm trung bình tổng average và tiêu chí
        }
      },
      {
        $limit: 3
      },
      {
        $project: {
          name: 1,
          images: 1,
          averageRating: 1,
          address: 1,
          isVerified: 1,
          industry: 1,
          size: 1,
          criteriaAverage: 1,
          overallAverage: 1,
          comments: 1
        }
      }
    ]);
  
      // return topCompanies;
      const populatedCompanies = await Company.populate(topCompanies, { path: 'comments' });

      return populatedCompanies;
    } catch (error) {
      console.error('Error fetching top supportive companies:', error);
    }
  }
  
  async get_my_business(req, res, next) {
    try {
      const company = await Company.findOne({ representativeIds: req.session.account });

      console.log("get my business : " + company._id.toString());
      const companyId = company._id.toString();
      const businesses = await Company.find({ companyId }).populate('companyID', 'profilePicture fullName');

      for (const business of businesses) {
        const company = business.companyID; 
        const profilePicture = business.profilePicture;
        const fullName = company.fullName; 
      }

      return businesses;
    } catch (error) {
      next(error);
    }
  }

  // search business
  async getbusinessbyTermRegex(req, res, next) {
    try {
      const term = req.params.term;
      const regex = new RegExp(term, 'i');
      console.log("regex: ", regex);

      let listBusiness;
      if (term === "all") {
        listBusiness = await Company.find().select('name images industry'); 
      } else {
        listBusiness = await Company.find({
          $or: [
            { name: regex },
            { industry: regex },
            { address: regex }
          ]
        }).select('name images industry'); 
      }

      if (listBusiness.length > 0) {
        res.json({ match: true, status: "success", message: 'Success', data: listBusiness });
      } else {
        res.json({ match: false, status: "warning", message: 'Fail', data: listBusiness});
      }

    } catch (error) {
      console.error('Error getting business:', error);
      throw error;
    }
  }

  async getBusiness(businessID) {
    console.log("curr business : " + businessID);
    try {
      const find = await Course.findById(businessID).populate('companyID', 'fullName');
      // console.log(find)
      if (find) {
        return find;
      } else {
        return "";
      }
    } catch (error) {
      console.log(error);
    }
  }

  async addRepresentative(req, res) {
    try {
      const { companyId } = req.params;
      const { email } = req.body;
      
      if (!validate.validateEmail(req.body.email)) {
          return res.status(400).json({
              status: 'warning',
              message: 'Invalid email. Please enter a valid email address!'
          });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ status: 'warning', message: 'User not found with this email! Please enter a valid email' });
      }
      //curr company
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found' });
      }
        // user đã là đại diện curr com
      if (company.representativeIds.includes(user._id)) {
        return res.status(400).json({ status: 'warning', message: 'User is already in this company!' });
      }

       // user đã thuộc một công ty khác
      const currentCompany = await Company.findOne({ representativeIds: user._id });

      if (currentCompany) {
        // Nếu hs công ty hiện tại của người dùng chưa cập nhật => xóa hồ sơ company này
        if (!currentCompany.isProfileUpdated) {
          await Company.findByIdAndDelete(currentCompany._id); 
        } else {
          return res.status(400).json({
            status: 'warning',
            message: 'User is already a representative for another company!',
          });
        }
      }

      // Thêm người dùng vào danh sách đại diện của công ty hiện tại
      company.representativeIds.push(user._id);
      await company.save();

      // add id công ty vào company của userschema
      user.company = company._id;
      await user.save();
  
      res.status(200).json({ status: 'success', message: 'Representative added successfully!' });
    } catch (error) {
      console.error('Error adding representative:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async viewRepresentatives(req, res) {
    try {
      const { companyId } = req.params;
  
      const company = await Company.findById(companyId).populate({
        path: 'representativeIds',
        select: 'fullName email profilePicture',
      });
  
      if (!company) {
        console.log(`Company with ID ${companyId} not found.`);
        return null;
      }
  
      return company;
    } catch (error) {
      console.error('Error fetching representatives:', error);
      throw error;
    }
  }

  async removeRepresentative(req, res) {
    try {
      const { companyId, representativeId } = req.params;
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found.' });
      }
  
      // người dùng là đại diện đầu tiên?
      if (company.representativeIds[0].toString() === representativeId) {
        return res.status(400).json({ status: 'warning', message: 'Cannot remove the main representative!' });
      }
  
      // người dùng thuộc danh sách đại diện
      if (!company.representativeIds.includes(representativeId)) {
        return res.status(404).json({ status: 'warning', message: 'Representative not found in this company.' });
      }
  
      // Xóa người dùng khỏi danh sách đại diện
      company.representativeIds = company.representativeIds.filter(id => id.toString() !== representativeId);
      await company.save();
  
      // Cập nhật trường `company` của user bị xóa (xóa liên kết với công ty)
      const user = await User.findById(representativeId);
      if (user) {
        user.company = null;
        await user.save();
      }

      //tạo lại company cho user
      await Company.create({
        representativeIds: [user._id],
        name: '', 
        isProfileUpdated: false, 
      });
  
      res.status(200).json({ status: 'success', message: 'Representative removed successfully!' });
    } catch (error) {
      console.error('Error removing representative:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async updateProfile(req, res, next) {
    try {
        const {
            name,
            industry,
            size,
            address,
            website,
            location,
            profile,
            contactEmail,
            phoneNumber,
            promotionVideo,
        } = JSON.parse(req.body.businessProfile);

        const representativeIds = req.session.account;

        const [lat, lng] = location ? location.split(',').map(Number) : [10.762622, 106.660172];
        const geoLocation = {
            type: 'Point',
            coordinates: [lng, lat], // GeoJSON requires [lng, lat]
        };

        const uploadedImages = req.files.images && req.files.images.length > 0
        ? req.files.images.map(file => `/images/company_image_details/${file.filename}`)
        : ['/images/default_companyImage_details.jpg']; // Ảnh mặc định nếu không upload
  
        const uploadedDocuments = req.files.documents && req.files.documents.length > 0
          ? req.files.documents.map(file => `/documents/${file.filename}`)
          : []; 

        const profileDescription = profile || '';

        const company = await Company.findOneAndUpdate(
            { representativeIds },
            {
                name,
                industry,
                size,
                address,
                website,
                location,
                profile: profileDescription,
                contactEmail,
                phoneNumber,
                promotionVideos: promotionVideo ? [promotionVideo] : [],
                images: uploadedImages,
                isProfileUpdated: true,
                location: geoLocation,
                documents: uploadedDocuments,
            },
            { new: true, upsert: true }
        );
        // update trường company trong user
        const user = await User.findById(representativeIds);
        user.company = company._id;
        await user.save();

        res.json({ success: true, company });
    } catch (error) {
        console.error('Error updating business profile:', error);
        next(error);
    }
  }

  async editCompanyProfile(req, res, next) {
    console.log("Edit company profile : ");

    try {
        const { companyId } = req.params;
        const currentCompany = await Company.findById(companyId);
        if (!currentCompany) {
          return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const {
            name,
            industry,
            size,
            address,
            website,
            location,
            profile,
            contactEmail,
            phoneNumber,
            promotionVideo,
        } = JSON.parse(req.body.businessProfile);

        const [lat, lng] = location ? location.split(',').map(Number) : [10.762622, 106.660172];
        const geoLocation = { type: 'Point', coordinates: [lng, lat] };

        const uploadedImages = req.files.images && req.files.images.length > 0
          ? req.files.images.map(file => `/images/company_image_details/${file.filename}`)
          : currentCompany.images || ['/images/default_companyImage_details.jpg'];
          
        const uploadedDocuments = req.files.documents && req.files.documents.length > 0
            ? req.files.documents.map(file => `/documents/${file.filename}`)
            : currentCompany.documents;

        const updatedPromotionVideos = promotionVideo
          ? [promotionVideo]
          : currentCompany.promotionVideos;

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            {
                name,
                industry,
                size,
                address,
                website,
                location: geoLocation,
                profile: profile || '',
                contactEmail,
                phoneNumber,
                promotionVideos: updatedPromotionVideos,
                images: uploadedImages,
                documents: uploadedDocuments,
                isProfileUpdated: true,
            },
            { new: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ success: false, message: 'Company not found for updating' });
        }

        res.json({ success: true, company: updatedCompany });
    } catch (error) {
        console.error('Error updating company profile:', error);
        next(error);
    }
  }

  async getBusinessProfile(businessId) {
    try {
      const find = await Company.findById(businessId);
      console.log("GET business profile : ", find);
      if (find) {
        return find;
      } else {
        console.log("ALO No company found");
        return "";
      }
    } catch (error) {
      console.log(error);
    }
  }

  async createInternship(req, res, next) {
    try {
      const { title, description } = req.body;
      const companyId = req.params.companyId;

      console.log('Received internship data:', { title, description, companyId });

      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const internship = new Internship({ title, description, company: companyId });
      await internship.save();
  
      company.internships.push(internship._id);
      await company.save();

      console.log('Internship created successfully:', { title, description });
      res.status(200).json({ status: 'success', message: 'Internship created successfully' });
      // res.redirect(`/home/business/${companyId}`);
    } catch (error) {
      console.error('Error creating internship:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async editInternship(req, res, next) {
    try {
      const internshipId = req.params.internshipId;
      const { title, description } = req.body;
      console.log('Editing internship with ID:', internshipId);

      const internship = await Internship.findByIdAndUpdate(
        internshipId,
        { title, description, createdAt: new Date().toUTCString() },
        { new: true }
      );
  
      if (!internship) {
        return res.status(404).json({ status: 'error', message: 'Internship not found' });
      }
  
      console.log('Internship updated successfully:', { title, description });
      res.status(200).json({ status: 'success', message: 'Internship updated successfully' });
    } catch (error) {
      console.error('Error updating internship:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async applyForInternship(req, res, next) {
    try {
      const { internshipId } = req.params;
      const { applicantName, applicantEmail, greeting } = req.body;
    
      console.log('Received Data:', { internshipId, applicantName, applicantEmail, greeting });
      console.log('Uploaded Files:', req.files);
  
      // Kiểm tra yêu cầu
      if (!applicantName || !applicantEmail || !greeting) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
      }
  
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        return res.status(404).json({ status: 'error', message: 'Internship not found.' });
      }
  
      // Xử lý file upload
      const documents = req.files && req.files.documents
        ? req.files.documents.map(file => `/documents/${file.filename}`)
        : [];
  
      // Tạo application
      const application = new Application({
        internship: internship._id,
        applicantId: req.session.account,
        applicantName,
        applicantEmail,
        greeting,
        documents,
        appliedAt: new Date(),
      });
  
      await application.save();
  
      // Cập nhật internship
      internship.applications.push(application._id);
      await internship.save();
  
      res.status(200).json({ status: 'success', message: 'Application submitted successfully!' });
    } catch (error) {
      console.error('Error applying for internship:', error.message, error.stack);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async getApplicationsNoti(req, res) {
    try {
      const { companyId } = req.params;
      
      const company = await Company.findById(companyId).select('isLocked representativeIds');
      if (!company) {
        return res.status(404).json({ status: 'error', message: 'Company not found' });
      }
      const internships = await Internship.find({ company: companyId }).select('_id');
  
      // danh sách chưa đọc
      const unreadApplicationsCount = await Application.countDocuments({
        internship: { $in: internships.map(i => i._id) },
        isViewed: false,
      });
      
      const user = await User.findById(req.session.account).select('isViewedByCompany company');
      // người dùng có thuộc công ty mới nhận thông báo lock/unlock
      if (!user || !company.representativeIds.includes(req.session.account)) {
        return res.status(403).json({ status: 'error', message: 'Unauthorized access' });
      }
      let notificationMessage = null;
      let unreadLockUnlockCount = 0;
      if (!user.isViewedByCompany && company.isLocked) {
        unreadLockUnlockCount = 1; // Chỉ tăng nếu user chưa xem thông báo lock
        notificationMessage = `Your company profile has been removed from public view by the administrator.`;
      } else if (!user.isViewedByCompany && !company.isLocked) {
        unreadLockUnlockCount = 1; // Tăng nếu user chưa xem thông báo unlock
        notificationMessage = `Your company profile has been restored and is now visible to the public.`;
      }
  
      // Tổng số thông báo chưa đọc (ứng dụng + lock/unlock)
      const totalUnreadCount = unreadApplicationsCount + unreadLockUnlockCount;

      // Lấy 5 ng gần đây
      const recentApplications = await Application.find({
        internship: { $in: internships.map(i => i._id) },
      })
        .populate({
          path: 'internship',
          select: 'title',
        })
        .sort({ appliedAt: -1 }) // Sắp xếp theo thời gian apply gần nhất
        .limit(5);
      
      console.log("notificationMessage: ", notificationMessage);
      console.log("Recent Applications: ", recentApplications);
      res.status(200).json({
        status: 'success',
        applications: recentApplications,
        unreadCount: totalUnreadCount,
        notificationMessage,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async markApplicationsAsViewed(req, res) {
    try {
      console.log("Marking applications as viewed");
      const { companyId } = req.params;
  
      const internships = await Internship.find({ company: companyId }).select('_id');
  
      await Application.updateMany(
        { internship: { $in: internships.map(i => i._id) } },
        { $set: { isViewed: true } }
      );

       // người dùng thuộc công ty mới lock/unlock
      const company = await Company.findById(companyId).select('representativeIds');
      if (!company || !company.representativeIds.includes(req.session.account)) {
        return res.status(403).json({ status: 'error', message: 'Unauthorized access' });
      }

      // Đánh dấu thông báo đã xem
      const user = await User.findById(req.session.account).select('isViewedByCompany');
      if (!user.isViewedByCompany) {
        user.isViewedByCompany = true;
        await user.save();
      }
  
      res.status(200).json({ status: 'success', message: 'Applications marked as viewed' });
    } catch (error) {
      console.error('Error marking applications as viewed:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async markStudentsAsViewed(req, res) {
    try {
        const studentId = req.session.userId;
        await Application.updateMany(
            { applicationId: studentId, isViewedByStudent: false },
            { $set: { isViewedByStudent: true } }
        );
        res.status(200).json({ status: 'success', message: 'Student Applications marked as viewed' });
    } catch (error) {
        console.error('Error marking applications as viewed:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async getApplicationDetails(req, res) {
    try {
      const companyId = req.params.businessId;
      const applicationId = req.params.applicationId;

      console.log('Fetching applications for company:', companyId);
  
      // // all Internship thuộc công ty id
      // const internships = await Internship.find({ company: companyId }).select('_id');
      // if (!internships.length) {
      //   console.log('No internships found for this company');
      //   return [];
      // }

      // // get all appl liên quan danh sách Internship
      // const applications = await Application.find({
      //   internship: { $in: internships.map(i => i._id) },
      // }).populate('internship'); // Populate lấy thêm thông tin Internship
  
      // if (!applications.length) {
      //   console.log('No applications found for this company');
      //   return [];
      // }

      // Tìm application để lấy internshipId
      const application = await Application.findById(applicationId).select('internship');
      if (!application) {
        console.error('Application not found');
        return [];
      }

      const internshipId = application.internship;

      // Lấy tất cả applications thuộc cùng internship
      const applications = await Application.find({ internship: internshipId })
        .populate({
          path: 'internship',
          select: 'title company',
          populate: {
            path: 'company',
            select: 'name', // Tên công ty
          },
        })
        .sort({ appliedAt: -1 }); // Sắp xếp theo thời gian nộp gần nhất

      console.log('Applications in same internship:', applications);

      return applications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).send('Internal Server Error');
      return [];
    }
  }

  async updateApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params;
      const { status, reasonOrMessage } = req.body;
  
      // Validate input
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      // Tìm ứng dụng và cập nhật
      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
  
      // Cập nhật status, checked isResponded
      application.status = status;
      application.reasonOrMessage = reasonOrMessage;
      application.responseAt = new Date().toUTCString();
      application.isResponded = true;
      await application.save();
  
      res.status(200).json({ message: `Status updated to ${status}` });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getStudentNotifications(req, res) {
    try {
      const studentId = req.session.account;
  
      // count số lượng phản hồi chưa đọc
      const unreadFeedbackCount = await Application.countDocuments({
        applicantId: studentId,
        isResponded: true,
        isViewedByStudent: false,
      });
  
      // ds phản hồi gần đây (max 5)
      const recentFeedbacks = await Application.find({
        applicantId: studentId,
        isResponded: true,
      })
        .populate({
          path: 'internship',
          select: 'title company',
          populate: {
            path: 'company',
            select: 'name',
          },
        })
        .sort({ appliedAt: -1 }) // xếp theo thời gian gần nhất
        .limit(5);
  
      res.status(200).json({
        status: 'success',
        feedbacks: recentFeedbacks,
        unreadCount: unreadFeedbackCount,
      });
    } catch (error) {
      console.error('Error fetching student notifications:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async getInternships(req, res) {
    try {
      console.log('Fetching internships ....');
      const companyId = req.params.businessId;

      console.log('Fetching internships for company:', companyId);

      // get all Internship thuộc công ty id
      const internships = await Internship.find({ company: companyId }).select('_id title');
      if (!internships.length) {
        console.log('No internships found for this company');
        return res.status(404).json({ status: 'warning', message: 'No internships found for this company' });
      }

      res.status(200).json({ status: 'success', internships });
    } catch (error) {
      console.error('Error fetching internships:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async getApplicationsByInternship(req, res) {
    try {
      const { internshipId } = req.params;
  
      // Tìm tất cả applications liên quan đến internshipId
      const applications = await Application.find({ internship: internshipId })
        .populate({
          path: 'internship',
          select: 'title company',
          populate: {
            path: 'company',
            select: 'name',
          },
        })
        .sort({ appliedAt: -1 }); // Sắp xếp theo thời gian apply gần nhất
  
      if (!applications.length) {
        console.log('No applications found for internship:', internshipId);
      } else {
        console.log('Applications found:', applications);
      }
  
      return applications;
    } catch (error) {
      console.error('Error fetching applications by internship:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      return [];
    }
  }
  
  async getStudentApplications(req, res) {
    try {
      const studentId = req.session.account;

      // find applications thuộc sinh viên hiện tại
      const applications = await Application.find({ applicantId: studentId })
      .populate({
        path: 'internship',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'name', // Lấy tên công ty
        },
      })
      .sort({ appliedAt: -1 }); // Sắp xếp theo thời gian apply gần nhất

      // không tìm thấy application
      if (!applications.length) {
        console.log('No applications found for student:', studentId);
        return [];
      }

      // Format kết quả để hợp với view
      const formattedApplications = applications.map(app => ({
        _id: app._id,
        appliedAt: app.responseAt,
        internship: {
          title: app.internship?.title || 'Unknown',
          companyName: app.internship?.company?.name || 'Unknown',
          companyId: app.internship?.company?._id || 'Unknown',
        },
        message: app.reasonOrMessage || 'Not Responded',
        mymessage: app.greeting || 'Error',
        status: app.status || 'Pending',
      }));

      console.log('Student applications:', formattedApplications);
      return formattedApplications;
    } catch (error) {
      console.error('Error fetching student applications:', error);
      res.status(500).send('Internal Server Error');
      return [];
    }
  }

  async addCommentAndRating(req, res) {
    try {
      const { companyId } = req.params;
      const { content, rating, detailedRatings } = req.body;
      const userId = req.session.account;
  
      // là admin thì ko dc rate
      const adminuser = await User.findById(userId).select('role');
      if (adminuser.role === 'admin') {
        return res.status(400).json({ status: 'warning', message: 'Admins cannot rate companies!' });
      }
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found' });
      }
  
      const user = await User.findById(userId).select('fullName email profilePicture role');
      if (!user) {
        return res.status(404).json({ status: 'warning', message: 'User not found' });
      }
  
      // không thể rỗng cả 3
      const hasDetailedRatings = detailedRatings && (
        detailedRatings.workEnvironment > 0 ||
        detailedRatings.trainingSupport > 0 ||
        detailedRatings.learningOpportunities > 0 ||
        detailedRatings.benefits > 0
      );
  
      if (!content && !rating && !hasDetailedRatings) {
        return res.status(400).json({ status: 'warning', message: 'Please provide a comment or rating or category rating!' });
      }
  
      // không cho cho acc mình rate
      if (company.representativeIds.includes(userId) && (rating || hasDetailedRatings)) {
        return res.status(400).json({ status: 'warning', message: 'Cannot rate your own company!' });
      }
  
      // không cho user thuộc role company rate
      if (user.role === 'company' && rating) {
        return res.status(400).json({ status: 'warning', message: 'Company representatives cannot rate companies!' });
      }
  
      // Kiểm tra nếu một trường đã được đánh giá thì tất cả các trường khác cũng phải được đánh giá
      if (hasDetailedRatings && (
        detailedRatings.workEnvironment == 0 ||
        detailedRatings.trainingSupport == 0 ||
        detailedRatings.learningOpportunities == 0 ||
        detailedRatings.benefits == 0
      )) {
        return res.status(400).json({ status: 'warning', message: 'Please rate all detailed criteria.' });
      }
      console.log('Detailed ratings:', detailedRatings);
      // Chuyển đổi các giá trị đánh giá chi tiết thành số
      const detailedRatingsNumeric = {
        workEnvironment: Number(detailedRatings.workEnvironment),
        trainingSupport: Number(detailedRatings.trainingSupport),
        learningOpportunities: Number(detailedRatings.learningOpportunities),
        benefits: Number(detailedRatings.benefits)
      };
      console.log('Detailed ratings numeric:', detailedRatingsNumeric);
      const newComment = new Comment({
        authorId: userId,
        authorName: user.fullName,
        authorEmail: user.email,
        authorPicture: user.profilePicture,
        companyId: companyId,
        content: content || '',
        createdAt: new Date().toLocaleString('vi-VN'),
        rating: rating ? Number(rating) : null,
        detailedRatings: detailedRatingsNumeric
      });
      await newComment.save();
  
      // Thêm comment vào danh sách của công ty
      company.comments.push(newComment._id);
  
      // Tính điểm trung bình từng tiêu chí
      const allRatings = await Comment.find({ companyId }).select('rating detailedRatings');
      if (allRatings.length > 0) {
        const totalRatings = allRatings.reduce((acc, comment) => {
          acc.total += comment.rating || 0;
          acc.workEnvironment += comment.detailedRatings.workEnvironment || 0;
          acc.trainingSupport += comment.detailedRatings.trainingSupport || 0;
          acc.learningOpportunities += comment.detailedRatings.learningOpportunities || 0;
          acc.benefits += comment.detailedRatings.benefits || 0;
          return acc;
        }, {
          total: 0,
          workEnvironment: 0,
          trainingSupport: 0,
          learningOpportunities: 0,
          benefits: 0
        });
  
        const averageRating = totalRatings.total / allRatings.length;
        const averageWorkEnvironment = totalRatings.workEnvironment / allRatings.length;
        const averageTrainingSupport = totalRatings.trainingSupport / allRatings.length;
        const averageLearningOpportunities = totalRatings.learningOpportunities / allRatings.length;
        const averageBenefits = totalRatings.benefits / allRatings.length;
  
        company.averageRating = averageRating.toFixed(2);
        company.ratings = {
          workEnvironment: averageWorkEnvironment.toFixed(2),
          trainingSupport: averageTrainingSupport.toFixed(2),
          learningOpportunities: averageLearningOpportunities.toFixed(2),
          benefits: averageBenefits.toFixed(2)
        };
        console.log('Average ratings, length > 0:', company.ratings);
      } else {
        company.averageRating = 0;
        company.ratings = {
          workEnvironment: 0,
          trainingSupport: 0,
          learningOpportunities: 0,
          benefits: 0
        };
        console.log('Average ratings, length = 0:', company.ratings);
      }
  
      await company.save();
  
      res.status(201).json({ status: 'success', message: 'Comment added successfully!', commentId: newComment._id });
    } catch (error) {
      console.error('Error adding comment and rating:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async replyToComment(req, res) {
    try {
      const { companyId, commentId } = req.params;
      const { content } = req.body;
      const userId = req.session.account;
  
      // Xác minh bình luận
      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        return res.status(404).json({ status: 'warning', message: 'Comment not found' });
      }
  
      // Xác minh công ty
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found' });
      }
  
      const user = await User.findById(userId).select('fullName email profilePicture');
      if (!user) {
        return res.status(404).json({ status: 'warning', message: 'User not found' });
      }
  
      if (!content) {
        return res.status(400).json({ status: 'warning', message: 'Reply content cannot be empty!' });
      }
  
      const newReply = new Comment({
        authorId: userId,
        authorName: user.fullName,
        authorEmail: user.email,
        authorPicture: user.profilePicture,
        companyId: companyId,
        createdAt: new Date().toLocaleString('vi-VN'),
        content,
      });
      await newReply.save();
  
      // Thêm reply vào danh sách replies của parent comment
      parentComment.replies.push(newReply._id);
      await parentComment.save();
  
      res.status(201).json({ status: 'success', message: 'Reply added successfully!' });
    } catch (error) {
      console.error('Error replying to comment:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async editComment(req, res) {
    try {
      const { companyId, commentId } = req.params;
      const { content } = req.body;
      const userId = req.session.account;
  
      if (!content) {
        return res.status(400).json({ status: 'warning', message: 'Comment content cannot be empty!' });
      }
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found' });
      }
  
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ status: 'warning', message: 'Comment not found!' });
      }
  
      // user is author of comment
      if (comment.authorId.toString() !== userId.toString()) {
        return res.status(403).json({ status: 'error', message: 'You are not authorized to edit this comment!' });
      }
  
      comment.content = content;
      comment.createdAt = new Date();
      comment.updatedAt = `Updated at ${new Date().toLocaleString('vi-VN')}`;
      await comment.save();
  
      res.status(200).json({ status: 'success', message: 'Comment updated successfully!', updatedContent: comment.content, updatedAt: comment.updatedAt });
    } catch (error) {
      console.error('Error editing comment:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async editReply(req, res) {
    try {
      const { companyId, replyId } = req.params;
      const { content } = req.body;
      const userId = req.session.account;
  
      if (!content) {
        return res.status(400).json({ status: 'warning', message: 'Reply content cannot be empty!' });
      }
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found' });
      }
  
      const reply = await Comment.findById(replyId);
      if (!reply) {
        return res.status(404).json({ status: 'warning', message: 'Reply not found!' });
      }
  
      // user is author of reply
      if (reply.authorId.toString() !== userId.toString()) {
        return res.status(403).json({ status: 'error', message: 'You are not authorized to edit this reply!' });
      }
  
      reply.content = content;
      reply.createdAt = new Date();
      reply.updatedAt = `Updated at ${new Date().toLocaleString('vi-VN')}`;
      await reply.save();
  
      res.status(200).json({ status: 'success', message: 'Reply updated successfully!', updatedContent: reply.content, updatedAt: reply.updatedAt });
    } catch (error) {
      console.error('Error editing reply:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async removeComment(req, res) {
    try {
      const { companyId, commentId } = req.params;
      const userId = req.session.account;
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found' });
      }
  
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ status: 'warning', message: 'Comment not found!' });
      }
  
      // Check admin authorization
      const user = await User.findById(userId).select('role');
      if (user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'You are not authorized to remove this comment!' });
      }
  
      // Update the comment content and reset ratings
      comment.content = 'This comment has been removed due to violation of our policies';
      comment.rating = null;
      comment.detailedRatings = {
        workEnvironment: null,
        trainingSupport: null,
        learningOpportunities: null,
        benefits: null,
      };
      await comment.save();
  
      const allRatings = await Comment.find({ companyId }).select('rating detailedRatings');
      if (allRatings.length > 0) {
        const totalRatings = allRatings.reduce((acc, comment) => {
          acc.total += comment.rating || 0;
          acc.workEnvironment += comment.detailedRatings.workEnvironment || 0;
          acc.trainingSupport += comment.detailedRatings.trainingSupport || 0;
          acc.learningOpportunities += comment.detailedRatings.learningOpportunities || 0;
          acc.benefits += comment.detailedRatings.benefits || 0;
          return acc;
        }, {
          total: 0,
          workEnvironment: 0,
          trainingSupport: 0,
          learningOpportunities: 0,
          benefits: 0,
        });
  
        const averageRating = totalRatings.total / allRatings.filter((c) => c.rating !== null).length;
        const averageWorkEnvironment = totalRatings.workEnvironment / allRatings.filter((c) => c.detailedRatings.workEnvironment !== null).length;
        const averageTrainingSupport = totalRatings.trainingSupport / allRatings.filter((c) => c.detailedRatings.trainingSupport !== null).length;
        const averageLearningOpportunities = totalRatings.learningOpportunities / allRatings.filter((c) => c.detailedRatings.learningOpportunities !== null).length;
        const averageBenefits = totalRatings.benefits / allRatings.filter((c) => c.detailedRatings.benefits !== null).length;
  
        company.averageRating = averageRating.toFixed(2);
        company.ratings = {
          workEnvironment: averageWorkEnvironment.toFixed(2),
          trainingSupport: averageTrainingSupport.toFixed(2),
          learningOpportunities: averageLearningOpportunities.toFixed(2),
          benefits: averageBenefits.toFixed(2),
        };
      } else {
        // Reset ratings if no valid comments are left
        company.averageRating = 0;
        company.ratings = {
          workEnvironment: 0,
          trainingSupport: 0,
          learningOpportunities: 0,
          benefits: 0,
        };
      }
  
      await company.save();
  
      res.status(200).json({ status: 'success', message: 'Comment removed successfully!' });
    } catch (error) {
      console.error('Error removing comment:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }
  
  async removeReply(req, res) {
    try {
      const { companyId, replyId } = req.params;
      const userId = req.session.account;
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found' });
      }
  
      const reply = await Comment.findById(replyId);
      if (!reply) {
        return res.status(404).json({ status: 'warning', message: 'Reply not found!' });
      }
  
      // admin
      const user = await User.findById(userId).select('role');
      if (user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'You are not authorized to remove this reply!' });
      }
  
      // Update reply content and isRemoved status
      reply.content = 'This reply has been removed due to violation of our policies';
      reply.isRemoved = true;
      await reply.save();
  
      res.status(200).json({ status: 'success', message: 'Reply removed successfully!' });
    } catch (error) {
      console.error('Error removing reply:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async reportComment(req, res) {
    try {
      const { companyId, commentId } = req.params;
      const userId = req.session.account;
  
      const comment = await Comment.findById(commentId).select('authorName content');
      if (!comment) {
        return res.status(404).json({ status: 'warning', message: 'Comment not found!' });
      }
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found!' });
      }
  
      const user = await User.findById(userId).select('fullName email');
      if (!user) {
        return res.status(404).json({ status: 'warning', message: 'User not found!' });
      }
  
      const adminEmail = 'wiyanchen33@gmail.com'; // Admin's email
        const subject = 'Comment Report';
        const emailBody = `
            <p>User <strong>${user.fullName}</strong> (${user.email}) has reported a comment.</p>
            <p><strong>Reported Comment Details:</strong></p>
            <ul>
                <li><strong>Comment Author:</strong> ${comment.authorName}</li>
                <li><strong>Comment Content:</strong> <em>${comment.content}</em></li>
                <li><strong>Company Profile:</strong> ${company.name}</li>
            </ul>
            <p>Please review the comment and take appropriate action.</p>
        `;

      await mailer.sendReportMail(user.email, adminEmail, subject, emailBody);
  
      res.status(200).json({ status: 'success', message: 'The comment has been reported to the administrator!' });
    } catch (error) {
      console.error('Error reporting comment:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async reportReply(req, res) {
    try {
      const { companyId, replyId } = req.params;
      const userId = req.session.account;
  
      const reply = await Comment.findById(replyId).select('authorName content');
      if (!reply) {
        return res.status(404).json({ status: 'warning', message: 'Reply not found!' });
      }
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ status: 'warning', message: 'Company not found!' });
      }
  
      const user = await User.findById(userId).select('fullName email');
      if (!user) {
        return res.status(404).json({ status: 'warning', message: 'User not found!' });
      }
  
      const adminEmail = 'wiyanchen33@gmail.com';
        const subject = 'Reply Report';
        const emailBody = `
            <p>User <strong>${user.fullName}</strong> (${user.email}) has reported a reply.</p>
            <p><strong>Reported Reply Details:</strong></p>
            <ul>
                <li><strong>Reply Author:</strong> ${reply.authorName}</li>
                <li><strong>Reply Content:</strong> <em>${reply.content}</em></li>
                <li><strong>Company Profile:</strong> ${company.name}</li>
            </ul>
            <p>Please review the reply and take appropriate action.</p>
        `;

      await mailer.sendReportMail(user.email, adminEmail, subject, emailBody);

      res.status(200).json({ status: 'success', message: 'The reply has been reported to the administrator!' });
    } catch (error) {
      console.error('Error reporting reply:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }
  
  async getStatisticalData (req, res) {
    try {
      const companies = await Company.find()
        .select('name industry averageRating ratings')
        .lean();
  
      // phân theo industry
      const industryStats = {};
      companies.forEach((company) => {
        const { industry } = company;
        if (!industryStats[industry]) {
          industryStats[industry] = 0;
        }
        industryStats[industry]++;
      });
  
      // Sắp theo điểm trung bình
      const sortedCompanies = [...companies].sort((a, b) => b.averageRating - a.averageRating);
      
      // Lấy số lượng người dùng thuộc vai trò student và company
      const studentCount = await User.countDocuments({ role: 'student' });
      const companyCount = await User.countDocuments({ role: 'company' });

      // count com mới
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const newCommentsCount = await Comment.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const businessProfileCount = await Company.countDocuments();

      return {
        companies: sortedCompanies,
        industryStats,
        studentCount,
        companyCount,
        newCommentsCount,
        businessProfileCount,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  async getTopCompaniesByCriteria(req, res) {
    try {
      const companies = await Company.find().select('name industry ratings').lean();
      const criteria = ['workEnvironment', 'trainingSupport', 'learningOpportunities', 'benefits'];
      const topCompaniesByIndustry = {};
  
      companies.forEach((company) => {
        const { industry, ratings, name } = company;
  
        if (!topCompaniesByIndustry[industry]) {
          topCompaniesByIndustry[industry] = {};
          criteria.forEach((criterion) => {
            topCompaniesByIndustry[industry][criterion] = [];
          });
        }
  
        criteria.forEach((criterion) => {
          const currentScore = ratings[criterion] || 0;
  
          // danh sách rỗng hoặc điểm cao hơn
          const currentTop = topCompaniesByIndustry[industry][criterion];
          if (currentTop.length === 0 || currentScore > currentTop[0].score) {
            topCompaniesByIndustry[industry][criterion] = [{ name, score: currentScore }];
          } 
          // điểm = điểm cao nhất
          else if (currentScore === currentTop[0].score) {
            topCompaniesByIndustry[industry][criterion].push({ name, score: currentScore });
          }
        });
      });
  
      console.log('Top Companies by Industry and Criteria:', topCompaniesByIndustry);
      return topCompaniesByIndustry;
    } catch (error) {
      console.error('Error in getTopCompaniesByCriteria:', error);
      throw error;
    }
  }  

  async getInternshipsForDashboard(req, res) {
    try {
      const internships = await Internship.find().sort({ createdAt: -1 });
  
      return internships;
    } catch (error) {
      console.error('Error fetching internships:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  async getFavoriteCompanies (req, res) {
    try {
        const user = await User.findById(req.session.account).populate('savedCompanies');
        
        if (!user) {
            return res.status(404).json({ status: 'warning', message: 'User not found!' });
        }

        return res.status(200).json({ status: 'success', companies: user.savedCompanies });
    } catch (error) {
        console.error('Error fetching favorite companies:', error);
        res.status(500).json({ status: 'error', message: 'Server error!' });
    }
  }


}
module.exports = new BusinessController();
