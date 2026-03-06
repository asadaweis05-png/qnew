
export const calculateDailyCalories = (data: {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  goal: 'lose_weight' | 'maintain' | 'gain_weight';
}) => {
  let bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age;
  bmr = data.gender === 'male' ? bmr + 5 : bmr - 161;

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  let tdee = bmr * activityMultipliers[data.activity_level];

  switch (data.goal) {
    case 'lose_weight':
      tdee -= 500;
      break;
    case 'gain_weight':
      tdee += 500;
      break;
    default:
      break;
  }

  return Math.round(tdee);
};
