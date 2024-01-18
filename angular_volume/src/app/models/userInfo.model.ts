export interface UserInfo {
  Wins: string;
  Losses: string;
  Played: string;
  createdAt: string;
  email: string;
  hash: string;
  hashedRt: string;
  id: string;
  img: string;
  is2faEnabled: boolean;
  isOnline: boolean;
  isPlaying: boolean;
  matchHistory: any[];
  qrcode2fa: string;
  secret2fa: string;
  updatedAt: string;
  username: string;
}

export const BLOCKED_USER_INFO: Partial<UserInfo> = {
  Wins: '0',
  Losses: '0',
  img: 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif',
  isOnline: false,
  isPlaying: false,
};
