import maleAvatar from './images/nutribuddy_male_avatar_1792114486389.png';
import femaleAvatar from './images/nutribuddy_female_avatar_1792114487193.png';
import maleWater from './images/nutribuddy_male_water_1792114489789.png';
import femaleWater from './images/nutribuddy_female_water_1792114488492.png';
import maleTired from './images/nutribuddy_male_tired_1792114488013.png';
import femaleTired from './images/nutribuddy_female_tired_1792114487471.png';

export const OFFICIAL_AVATARS = {
  male: {
    default: maleAvatar,
    water: maleWater,
    tired: maleTired,
  },
  female: {
    default: femaleAvatar,
    water: femaleWater,
    tired: femaleTired,
  },
};

export const getAvatarByGender = (gender: 'masculino' | 'feminino' | string) => {
  return gender === 'feminino' ? femaleAvatar : maleAvatar;
};
