import { Channel, User, UserRole } from '@prisma/client';
import { ConsoleLogger, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import { UserStatus } from '@prisma/client';

@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}


  async deleteAllChannels(){
    await this.prisma.message.deleteMany();
    await this.prisma.channelMembership.deleteMany();
    await this.prisma.channel.deleteMany();
    return true;
  }


  async changeUserStatus(channelId: string, username: string, status: string | null) {
    console.log('changeUserStatus', channelId, username, status);
    const user = await this.usersService.findUserByName(username);
    const channel = await this.prisma.channel.findUnique({
      where:{
        id: channelId
      }
    });
    return this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: user.id,
          channelId: channel!.id
        }
      },
      data: {
        status: status as UserStatus | null
      }
    });
    }


  async createPrivateChannel(channelName:string) {
    return this.prisma.channel.create({
        data: {
          type: 'PRIVATE',
          name: channelName,
          img: 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif',
        },
    });
  }

  async createPublicChannel(channelName:string, password:string) {
    return this.prisma.channel.create({
        data: {
          type: 'PUBLIC',
          name: channelName,
          password: password,
          img: 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif',
        },
    });
  }

  async createDirectMembership(user:any, channel:any) {
    return this.prisma.channelMembership.create({
      data: { 
        user: { connect: { id: user.id } },
        channel: { connect: { id: channel.id } },
        role: 'MEMBER'
      }
    });
  }

  async createChannelMembership(user:User, channel:Channel, role: UserRole) {
    return this.prisma.channelMembership.create({
      data: {
        user: { connect: { id: user.id } },
        channel: { connect: { id: channel.id } },
        role: role
      }
    });
  }

  async createDirect(username1:string, username2:string) {
    const direct = await this.prisma.channel.create({
        data: {
          type: 'DIRECT',
        },
    });
    const user1 = await this.usersService.findUserByName(username1);
    const user2 = await this.usersService.findUserByName(username2);
    const membership1 = await this.createDirectMembership(user1, direct);
    const membership2 = await this.createDirectMembership(user2, direct);
    return this.prisma.channel.update({
      where: {
        id: direct.id,
      },
      data: {
        lastSeen: [],
        members: {
          connect: [
            { 
              userId_channelId: {
                userId: membership1.userId,
                channelId: direct.id
              }
            },
            { 
              userId_channelId: {
                userId: membership2.userId,
                channelId: direct.id
              }
            }
          ]
        },
      },
    });
  }

  async createNewChannel(channelName: string, users: string[], creator: string, groupType: string, password: string) {
    let obJChannel;
    try {
    if (groupType !== 'public') {
      obJChannel = await this.createPrivateChannel(channelName);
    } else {
      obJChannel = await this.createPublicChannel(channelName, password);
    } } catch (error) {
      return null;
    }
    const objOwn = await this.usersService.findUserByName(creator);
    await this.createChannelMembership(objOwn, obJChannel, 'OWNER');
    const objUsers = await this.prisma.user.findMany({
      where: {
        username:{in:users}
      }
    });
    for (const user of objUsers) {
      await this.createChannelMembership(user, obJChannel, "MEMBER");
    }
    return {
      ...obJChannel,
      members:objUsers.map(user=>{
        return {
          username: user.username,
        }
      })
    }
  }

  async createChannelMessage(channelId:string, content:string, username:string) {
    ///TO DO: se non trova channel crealo
    const channel = await this.prisma.channel.findUniqueOrThrow({
      where: {
        id: channelId
      }
    });

    const sender = await this.usersService.findUserByName(username);
    await this.prisma.channel.update({
      data:{
        lastSeen: []
      },
      where:{
        id: channelId
      }
    });
    return this.prisma.message.create({
      data: {
        senderId: sender.id,
        channelId: channel.id,
        content: content
      },
    });
  }

  async createDirectMessage(receiverName: string, content: string, username: string) {
    const sender = await this.usersService.findUserByName(username);
    const receiver = await this.usersService.findUserByName(receiverName);
  
    // Check if the direct channel already exists
    let channel = await this.prisma.channel.findFirst({
      where: {
        type: "DIRECT",
        AND:[
          {
            members:{
              some:{
                userId:sender.id
              }
            }
          },
          {
            members:{
              some:{
                userId:receiver.id
              }
            }
          }
        ]
      },
    });
    let newChannel = false;
    if (!channel) {
      newChannel = true;
      channel = await this.createDirect(username, receiverName);
    }
  
    await this.prisma.message.create({
      data: {
        channelId: channel.id,
        senderId: sender.id,
        content: content,
      },
    });
    return {newChannel, 
      channel: {
        ...channel,
        members: [{username: sender.username }, {username: receiver.username}]
      }};
  }  

  async getChannelById(id: string){
    return await this.prisma.channel.findUnique({
      where:{
        id
      },
      include:{
        members: {
          include:{
            user: {
              select:{
                id: true,
                username: true,
                blockedUsers: true,
                  blockedBy: {
                    select:{
                      blocker:
                      {
                        select:{
                          username: true
                        }
                      }
                  }
                }
              },
            },
          },
        },
      },
    });
  }

  async getChannelMsg(sender: string, receiver:string){;
    const senderUser = await this.usersService.findUserByName(sender);
    const receiverUser = await this.usersService.findUserByName(receiver);
  
    return await this.prisma.message.findMany({
      where:{

        channel:{
          AND:[
            {
              members:{
                some:{
                  userId:senderUser.id
                }
              }
            },
            {
              members:{
                some:{
                  userId:receiverUser.id
                }
              }
            }
          ]
        },
      },
      include:{
        sender: true
      }
    })
  }

  async getUserChannels(username: string){
    const user = await this.prisma.user.findFirst({
      where:{username}
    });
    if (!user){
      return null;
    }
    return await this.prisma.channel.findMany({
      where:{
        members:{
          some:{
            userId:user.id
          }
        },
      },
      include:{
        members: {
          include:{
            user: {
              select:{
                username: true
              }
            }
          }
        },
      }
    })
  }

  async getLastSeen(id: string){
    const channel = await this.prisma.channel.findUnique({
      where:{
        id
      }
    });
    return channel?.lastSeen;
  }

  async getChannelMsgById(id: string){;
    return await this.prisma.message.findMany({
      where:{channelId: id},
      include:{
        sender: true,
      }
    })
  }

  async flagLastMessage(channelId: string, user: string){
    const userObj = await this.usersService.findUserByName(user);
    return await this.prisma.channel.update({
      where:{
        id: channelId
      },
      data:{
        lastSeen: {push: userObj.username},
      }
    });
  }

  async setAdmin(channelId: string, user: string){
    const userObj = await this.usersService.findUserByName(user);
    return await this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: userObj.id,
          channelId: channelId
        }
      },
      data:{
        role: "ADMIN",
      }
    });
  }


  async rmAdmin(channelId: string, username: string){
    const userObj = await this.usersService.findUserByName(username);
    return await this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: userObj.id,
          channelId: channelId
        }
      },
      data:{
        role: "MEMBER",
      }
    });
  }

  async rmChannel(channelId: string){
    return await this.prisma.channel.delete({
      where:{
        id: channelId
      }
    });
  }

  async rmUserFromChannel(channelId: string, username: string){
    const userObj = await this.usersService.findUserByName(username);
    return await this.prisma.channelMembership.delete({
      where:{
        userId_channelId:{
          userId: userObj.id,
          channelId: channelId
        }
      }
    });
  }
}
