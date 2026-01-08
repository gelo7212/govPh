import { Request, Response } from 'express';
import { GeoAggregator, handleServiceError, sendErrorResponse, SosAggregator } from '@gov-ph/bff-core';
import { IdentityAggregator } from './identity.aggregator';
import { DecodedToken, decodeJWT } from '../../utils/jwt';
import { CitizenRegistrationData } from '@gov-ph/bff-core/dist/types';
import { getFirebaseUserByUid, isAnonymousUserByFirebaseToken, validateFirebaseToken } from './../../utils/firebase'

export class IdentityController {
  private aggregator: IdentityAggregator;
  private geoAggregator?: GeoAggregator;
  private sosAggregator?: SosAggregator;

  constructor(aggregator: IdentityAggregator, geoAggregator?: GeoAggregator, sosAggregator?: SosAggregator) {
    this.aggregator = aggregator;
    this.geoAggregator = geoAggregator;
    this.sosAggregator = sosAggregator;
  }

  async getFirebaseAccount(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseUid } = req.params;
      if (!firebaseUid) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Firebase UID is required');
        return;
      }

      const user = await this.aggregator.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        sendErrorResponse(res, 404, 'NOT_FOUND', 'User not found');
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
        message: 'User fetched successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch user account');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async registerCitizen(req: Request, res: Response): Promise<void> {
    try {
      // Require Authorization header with Firebase token
      const authHeader = req.headers.authorization as string;
    
      const body = req.body as CitizenRegistrationData;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Authorization header with Firebase token is required');
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const isValid = await validateFirebaseToken(token);

      if(body.email !== isValid?.email) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Email in token does not match email in registration data');
        return;
      }
    

      if (!isValid) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', isValid || 'Invalid Firebase token');
        return;
      }

      const firebaseUser = await  getFirebaseUserByUid(isValid.uid);
      console.log('Firebase user for registration:', firebaseUser);
      if(!firebaseUser) {
        sendErrorResponse(res, 404, 'NOT_FOUND', 'Firebase user not found');
        return;
      }
      if(firebaseUser.emailVerified === false) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Email must be verified to register');
        return;
      }

      
      const municipality = body.address.city;

      const municipalityCode =  await this.geoAggregator?.getMunicipalityByCode(municipality);

      if(!municipalityCode || !municipalityCode.data) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', `Unable to determine municipality code for: ${municipality}`);
        return;
      }

      console.log('Determined municipality code:', municipalityCode);
      body.address.municipalityId = municipalityCode.data._id;
      const newUser = await this.aggregator.registerCitizenUser(body, undefined, municipalityCode.data.code);
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Citizen user registered successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to register citizen user');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const isValid = await this.aggregator.validateToken(token);
      res.status(200).json({
        success: true,
        data: { isValid },
        timestamp: new Date(),
      });
    }
    catch (error) {
      const errorInfo = handleServiceError(error, 'Token validation failed');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Refresh token is required');
        return;
      }
      const decoded: DecodedToken | null = await decodeJWT(refreshToken);
      console.log('Decoded refresh token:', decoded);
      const sosReport = await this.sosAggregator?.getActiveSosByCitizen(decoded?.identity.userId || '', decoded?.actor?.cityCode || '');
      if (sosReport && sosReport.data) {
        console.log('Active SOS report found for user during token refresh:', sosReport.data);
      }
      const newTokens = await this.aggregator.refreshToken(refreshToken, sosReport?.data?.id);
      res.status(200).json({
        success: true,
        data: newTokens.data,
        timestamp: new Date(),
      });
    }
    catch (error) {
      const errorInfo = handleServiceError(error, 'Token refresh failed');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
  
  async getToken(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseUid } = req.body;
      const { authorization } = req.headers;
      if (!firebaseUid) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Firebase UID is required in request body');
        return;
      }
      const token = authorization && authorization.startsWith('Bearer ') ? authorization.replace('Bearer ', '') : null;
      const isAnonymous = token && await isAnonymousUserByFirebaseToken(token);
      if (isAnonymous) {
        console.log('User is identified as anonymous based on Firebase token.');
        const token = await this.aggregator.getToken(firebaseUid, undefined, undefined, 'ANON_CITIZEN');
        res.status(200).json({
          success: true,
          data: token.data,
          timestamp: new Date(),
        });
        return;
      }

      const user = await this.aggregator.getUserByFirebaseUid(firebaseUid);
      const firebaseUser = await getFirebaseUserByUid(firebaseUid);
      if(firebaseUser?.emailVerified === false) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Email must be verified to generate token');
        return;
      }
      if (!user) {
        sendErrorResponse(res, 404, 'NOT_FOUND', 'User not found');
        return;
      }

      console.log('Generating token for user:', user);

      const sosReport = await this.sosAggregator?.getActiveSosByCitizen(user.data.id, user.data.municipalityCode);
      if (sosReport && sosReport.data) {
        console.log('Active SOS report found for user:', sosReport.data);
      }

      
      const result = await this.aggregator.getToken(firebaseUid, user.data.id, sosReport?.data?.id);
      res.status(200).json({
        success: true,
        data: result.data,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to generate token');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.context?.user?.id;
      if (!userId) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'User authentication required');
        return;
      }

      const profile = await this.aggregator.getProfile(userId);
      res.status(200).json({
        success: true,
        data: profile.data,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch user profile');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Invalidate token logic
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Logout failed');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      // phone number format is 10 digits without country code - check format
      const { authorization } = req.headers;
      if(!authorization || !authorization.startsWith('Bearer ')) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Authorization header with Firebase token is required');
        return;
      }
      
      const { phoneNumber, context } = req.body;
;
      if (!phoneNumber || !context) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Phone number and context are required for sending OTP');
        return;
      }

      const isValidPhone = /^\d{10}$/.test(phoneNumber);
      if (!isValidPhone) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Phone number must be 10 digits without country code');
        return;
      }

      const formattedPhoneNumber = `+63${phoneNumber}`;

      const token = authorization.replace('Bearer ', '');
      if(!token) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Invalid Authorization header format');
        return;
      }
      if(context === 'registration') {
        const decodedFirebaseToken = await validateFirebaseToken(token);
        if (!decodedFirebaseToken) {
          sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Invalid Firebase token in Authorization header');
          return;
        }
        
        const firebaseUser = await  getFirebaseUserByUid(decodedFirebaseToken.uid);
        console.log('Firebase user for OTP registration:', firebaseUser);
        if(firebaseUser?.emailVerified === false) {
          sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Email must be verified to send registration OTP');
          return;
        }
        
        const otpResponse = await this.aggregator.sendOtp(formattedPhoneNumber, context, firebaseUser?.uid, undefined);
        res.status(200).json({
          success: otpResponse.success,
          data: { message: otpResponse.data.message },
          timestamp: new Date(),
        });
      }
      else {
        new Error('Not implemented yet for non-registration contexts');
      }
      
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to send OTP');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {

      const { authorization } = req.headers;
      if(!authorization || !authorization.startsWith('Bearer ')) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Authorization header with Firebase token is required');
        return;
      }

      const { phoneNumber, code, context } = req.body;
      if (!phoneNumber || !code || !context) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Phone number, code, and context are required for OTP verification');
        return;
      }
      
      const isValidPhone = /^\d{10}$/.test(phoneNumber);
      if (!isValidPhone) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Phone number must be 10 digits without country code');
        return;
      }
      const formattedPhoneNumber = `+63${phoneNumber}`;
       const token = authorization.replace('Bearer ', '');
      if(!token) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Invalid Authorization header format');
        return;
      }

      if(context === 'registration') {
        const decodedFirebaseToken = await validateFirebaseToken(token);
        if (!decodedFirebaseToken) {
          sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Invalid Firebase token in Authorization header');
          return;
        }
        
        const firebaseUser = await  getFirebaseUserByUid(decodedFirebaseToken.uid);
        console.log('Firebase user for OTP registration:', firebaseUser);
        if(firebaseUser?.emailVerified === false) {
          sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Email must be verified to send registration OTP');
          return;
        }
        await this.aggregator.verifyOtp(formattedPhoneNumber, code, context, firebaseUser?.uid, undefined);
        res.status(200).json({
          success: true,
          data: { message: 'OTP verified successfully' },
          timestamp: new Date(),
        });
        return;
      }
      new Error('Not implemented yet for non-registration contexts');
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to verify OTP');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}
