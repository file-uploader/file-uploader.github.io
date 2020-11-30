export class File {
  name: string;
  size: number;
  date: firebase.default.firestore.Timestamp;
  url: string
  id?: string;
}