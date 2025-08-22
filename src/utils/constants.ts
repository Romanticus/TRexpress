import 'dotenv/config';

export const PORT = Number(process.env.PORT) || 3000;

export const  JWT_ACCESS_EXPIRES_IN = process.env.AUTH_ACCESS_TOKEN_EXPIRY as any || "15m";
export const JWT_REFRESH_EXPIRES_IN = process.env.AUTH_REFRESH_TOKEN_EXPIRY as any|| "7d";
export const JWT_ACCESS_SECRET = process.env.JWT_SECRET || "SecretAccessToken";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "SecretRefreshToken";

export const BCRYPT_SALT_ROUNDS =  Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
 
 

 export const enum HttpStatus {
    
  
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  
  
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  
 
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503

 }