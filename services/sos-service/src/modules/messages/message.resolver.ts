import { SYSTEM_MESSAGES } from "./message.constant";

export const nextMessageResolver = async (
    action:string,
    ) => {
  switch(action) {
    case 'SHARE_PHONE_NUMBER':
        return SYSTEM_MESSAGES.SHARE_PHONE_NUMBER_CONSENT;
    case 'REQUEST_PHONE_NUMBER':
        return SYSTEM_MESSAGES.REQUEST_PHONE_NUMBER;
    default:
      return null;
  }
}