import { Request, Response } from 'express';
import { GeoAggregator, handleServiceError, sendErrorResponse, SosAggregator } from '@gov-ph/bff-core';
import { IdentityAggregator } from './identity.aggregator';
import { DecodedToken, decodeJWT } from '../../utils/jwt';
import { CitizenRegistrationData } from '@gov-ph/bff-core/dist/types';
import { getFirebaseUserByUid, validateFirebaseToken } from './../../utils/firebase';

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
    

      if (!isValid) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', isValid || 'Invalid Firebase token');
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
        data: newTokens,
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
      const { authorization, 'x-client-id': clientId } = req.headers;
      if(!clientId || (clientId !== process.env.CLIENT_ID_ADMIN && clientId !== process.env.CLIENT_ID_RESCUE)) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Invalid client ID');
        return;
      }

      if (!firebaseUid) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Firebase UID is required in request body');
        return;
      }
      const token = authorization && authorization.startsWith('Bearer ') ? authorization.replace('Bearer ', '') : null;
      const isValid = token ? await validateFirebaseToken(token) : false;
      if (!isValid) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', isValid || 'Invalid Firebase token');
        return;
      }

      const firebaseId = isValid.uid;

      const firebaseAccount = await getFirebaseUserByUid(firebaseId);
      if (!firebaseAccount) {
        sendErrorResponse(res, 404, 'NOT_FOUND', 'Firebase user not found');
        return;
      }

      if(firebaseAccount.disabled) {
        sendErrorResponse(res, 403, 'FORBIDDEN', 'Firebase user account is disabled');
        return;
      }
      
      if (!firebaseAccount.emailVerified) {
        sendErrorResponse(res, 403, 'FORBIDDEN', 'Firebase user email is not verified');
        return;
      }

      const user = await this.aggregator.getUserByFirebaseUid(firebaseId);
      if (!user) {
        sendErrorResponse(res, 404, 'NOT_FOUND', 'User not found');
        return;
      }
      const userRole = user.data.role.toLocaleLowerCase();
      // app_admin city_admin sos_admin

      if(userRole !== 'app_admin' && userRole !== 'city_admin' && userRole !== 'sos_admin') {
        sendErrorResponse(res, 403, 'FORBIDDEN', 'User does not have admin or rescue privileges');
        return;
      }
      
      const result = await this.aggregator.getToken(firebaseUid, user.data.id);
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
}
