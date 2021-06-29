export class User{
  constructor(
    public email: string, 
    public id: string, 
    public refreshToken: string
  ){}
}

export class UserAdditionalInfo {
  email: string;
  confirmDelete: boolean;
  id?: string;
}

export class LoginReport {
  userEmail: string;
  date: firebase.default.firestore.Timestamp;
  id?: string;
}