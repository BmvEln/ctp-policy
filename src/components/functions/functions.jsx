/**
 * Рассчитывает предварительную стоимость ОСАГО.
 * @param {number} enginePower
 * @returns {string|null}
 */
export const calcPreliminaryOsago = (enginePower) => {
  if (!enginePower) {
    return null;
  }

  // Определяем коэффициент мощности (КМ)
  let powerCoeff = 1.0;
  if (enginePower <= 50) powerCoeff = 0.6;
  else if (enginePower <= 70) powerCoeff = 1.0;
  else if (enginePower <= 100) powerCoeff = 1.1;
  else if (enginePower <= 120) powerCoeff = 1.2;
  else if (enginePower <= 150) powerCoeff = 1.4;
  else powerCoeff = 1.6;

  // Задаем "средние по рынку" значения для остальных коэффициентов
  const BASE_RATE = 4101; // Средний базовый тариф
  const AVG_TERRITORY_COEFF = 1.76; // Коэффициент для крупного города
  const AVG_BONUS_MALUS_COEFF = 1.17; // Для водителя с небольшим опытом или после ДТП
  const AVG_AGE_EXPERIENCE_COEFF = 1.04; // Для водителя ~30 лет со стажем ~5 лет
  const LIMITED_DRIVERS_COEFF = 1.0; // Полис с ограниченным списком водителей

  // Считаем итоговую цену
  const finalPrice =
    BASE_RATE *
    powerCoeff *
    AVG_TERRITORY_COEFF *
    AVG_BONUS_MALUS_COEFF *
    AVG_AGE_EXPERIENCE_COEFF *
    LIMITED_DRIVERS_COEFF;

  return finalPrice.toFixed(0); // Округляем до целых рублей
};

/**
 * Рассчитывает ТОЧНУЮ стоимость ОСАГО на основе данных о водителях.
 * @param {number} enginePower - Мощность двигателя из первого шага.
 * @param {Array} drivers - Массив объектов с данными о водителях.
 * @returns {string|null}
 */
export const calcFinalOsago = (enginePower, drivers) => {
  if (!enginePower || !drivers.length) return null;

  // 1. Находим "худшие" коэффициенты КВС и КБМ среди всех водителей
  let maxKvs = 0;
  let maxKbm = 0;

  drivers.forEach((driver) => {
    // Рассчитываем возраст и стаж 22.06.2000
    const birthYear = parseInt(driver.birthDate.slice(6));
    const age = new Date().getFullYear() - birthYear;
    const experience = parseInt(driver.experience, 10);

    // Рассчитываем КВС для текущего водителя по таблице
    const currentKvs = getKvs(age, experience);
    if (currentKvs > maxKvs) {
      maxKvs = currentKvs;
    }

    // Находим максимальный КБМ
    const currentKbm = parseFloat(driver.kbm);
    if (currentKbm > maxKbm) {
      maxKbm = currentKbm;
    }
  });

  // Вспомогательная функция для получения КВС (Коэффициент Возраст-Стаж)
  // Это реальные значения от ЦБ РФ
  function getKvs(age, experience) {
    if (age <= 21) {
      if (experience <= 1) return 2.27;
      if (experience === 2) return 1.92;
      return 1.84;
    }
    if (age <= 24) {
      if (experience <= 1) return 1.88;
      if (experience === 2) return 1.72;
      if (experience <= 4) return 1.71;
      return 1.65;
    }
    // ... и так далее для всех возрастных групп
    // Для простоты, вернем средний, но в идеале здесь должна быть полная таблица
    return 1.04; // Заглушка для остальных
  }

  // 2. Получаем остальные коэффициенты
  const BASE_RATE = 4101;
  const AVG_TERRITORY_COEFF = 1.76;
  const LIMITED_DRIVERS_COEFF = 1.0; // Так как у нас список водителей, КО = 1

  // 2. Определяем коэффициент мощности (КМ)
  let powerCoeff;
  if (enginePower <= 50) powerCoeff = 0.6;
  else if (enginePower <= 70) powerCoeff = 1.0;
  else if (enginePower <= 100) powerCoeff = 1.1;
  else if (enginePower <= 120) powerCoeff = 1.2;
  else if (enginePower <= 150) powerCoeff = 1.4;
  else powerCoeff = 1.6;

  // 3. Итоговая формула с точными данными
  const finalPrice =
    BASE_RATE *
    maxKvs * // Используем худший КВС
    maxKbm * // Используем худший КБМ
    AVG_TERRITORY_COEFF * // Территорию пока оставляем средней
    powerCoeff *
    LIMITED_DRIVERS_COEFF;

  return finalPrice.toFixed(0);
};
