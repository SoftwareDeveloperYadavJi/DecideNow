import { Length, IsInt, IsString, Min, Max } from 'class-validator';
import {
  MAX_NAME_LENGTH,
  MAX_NOMINATION_LENGTH,
  MAX_TOPIC_LENGTH,
  MAX_VOTES_PER_VOTER,
  POLL_ID_LENGTH,
} from './constants';

export class CreatePollDto {
  @IsString()
  @Length(1, MAX_TOPIC_LENGTH)
  topic: string;

  @IsInt()
  @Min(1)
  @Max(MAX_VOTES_PER_VOTER)
  votesPerVoter: number;

  @IsString()
  @Length(1, MAX_NAME_LENGTH)
  name: string;
}

export class JoinPollDto {
  @IsString()
  @Length(POLL_ID_LENGTH, POLL_ID_LENGTH)
  pollID: string;

  @IsString()
  @Length(1, MAX_NAME_LENGTH)
  name: string;
}

export class NominationDto {
  @IsString()
  @Length(1, MAX_NOMINATION_LENGTH)
  text: string;
}
