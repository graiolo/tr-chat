import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { UserInfo } from 'src/app/models/userInfo.model';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  constructor(private readonly http: HttpClient) {}

  async getFriendInfo(username: string): Promise<UserInfo> {
    return lastValueFrom(this.http.get<UserInfo>(`/nest/users/${username}`));
  }

  async getFriends(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/`));
  }

  async isFriend(friend: string): Promise<boolean> {
    const friends = await Promise.all([
      this.getFriends(),
      this.getFriendRequestsSend(),
      this.getFriendRequestsRecv(),
    ]);
    return friends.flat().some((f) => f.username === friend);
  }

  async addFriend(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/invite/`, { friend: username })
    );
  }

  async getFriendRequestsRecv(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/requests/received/`));
  }

  async getFriendRequestsSend(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/requests/sent/`));
  }

  async acceptFriend(username: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(`/nest/friends/accept/`, { friend: username })
    );
  }

  async deleteFriend(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/delete/`, { friend: username })
    );
  }

  async rejectFriend(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/reject/`, { friend: username })
    );
  }

  async blockUser(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/block/`, { to_block: username })
    );
  }

  async unblockUser(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/unblock/`, { to_unblock: username })
    );
  }

  async getBlockedUsers(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/blockeds/`));
  }

  async isBlocked(user: string): Promise<boolean> {
    const blockedUsers = await this.getBlockedUsers();
    return blockedUsers.some((f: any) => f.username === user);
  }
}
