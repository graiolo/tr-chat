//src/auth/entity/auth.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class AuthEntity {
  @ApiProperty()
  username: string;
  @ApiProperty()
  accessToken: string;
}