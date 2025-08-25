import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class RespondFriendRequestDto {
    @ApiProperty({
        description: 'Action to take on the friend request',
        enum: ['accept', 'reject'],
        example: 'accept'
    })
    @IsEnum(['accept', 'reject'], { message: 'Action must be either "accept" or "reject"' })
    @IsNotEmpty()
    action: 'accept' | 'reject';
}
