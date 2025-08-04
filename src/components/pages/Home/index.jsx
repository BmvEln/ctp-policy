import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { calcPreliminaryOsago } from "../../functions/functions.jsx";
import { useFetch } from "../../functions/hooks.jsx";

import Page from "../../layout/Page/index.jsx";
import { Button, Input, Modal, Select } from "antd";
import PolicyForm from "../../blocks/PolicyForm/index.jsx";

// ОСАГО (Обязательное страхование автогражданской ответственности)

// Что сделать позже?
// - добавить строку которая бы показывалась всегда, чтобы пользователь знал, что вбивает
// - маску для ввода серии и номера ВУ
// - маска для даты рождения
// - сделать фильтрацию в таблице по статусу

const getEnginePower = (mark, model, carData) => {
  if (!mark || !model) {
    return null;
  }

  const selectedMarkData = carData.find((item) => item.name === mark);
  const selectedModelData = selectedMarkData?.models.find(
    (item) => item.name === model,
  );

  return selectedModelData?.avgPower;
};

function Home() {
  const [carData] = useFetch("http://localhost:3000/marks");

  const location = useLocation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [carMark, setCarMark] = useState(undefined),
    [carModel, setCarModel] = useState(undefined),
    [carRelease, setCarRelease] = useState(undefined),
    [carTechCondition, setTechCondition] = useState(undefined),
    [preliminaryPrice, setPreliminaryPrice] = useState(undefined);

  const modelsForSelectedMark = !carMark
    ? []
    : carData.find((item) => item.name === carMark)?.models || [];

  // ГОТОВИМ ОБЪЕКТ initialValues для нового полиса
  const initialValuesForNewPolicy = {
    carMark: carMark,
    carModel: carModel,
    enginePower: getEnginePower(carMark, carModel, carData),
    costCTP: preliminaryPrice,
  };

  useEffect(() => {
    if (location.pathname === "/anketa") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [location.pathname]);

  const handleChangeMark = useCallback((value) => {
    setCarMark(value);

    setCarModel(undefined);
    setCarRelease(undefined);
    setTechCondition(undefined);
    setPreliminaryPrice(undefined);
  }, []);

  const handleChangeModel = useCallback((value) => {
    setCarModel(value);

    setCarRelease(undefined);
    setTechCondition(undefined);
    setPreliminaryPrice(undefined);
  }, []);

  const handleChangeRelease = useCallback((value) => {
    setCarRelease(value.target.value);
  }, []);

  const handleChangeTechCondition = useCallback((value) => {
    setTechCondition(value.target.value);
  }, []);

  const handleClickCalc = useCallback(() => {
    console.log("Производится расчет...");

    const price = calcPreliminaryOsago(
      getEnginePower(carMark, carModel, carData),
    );

    setPreliminaryPrice(price);
  }, [carData, carMark, carModel]);

  const handleCloseModal = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (!carData) {
    return null;
  }

  return (
    <Page className="Home">
      <div className="line upper-middle text_font-24">Калькулятор ОСАГО</div>

      <div style={{ display: "flex", columnGap: "12px", marginBottom: "12px" }}>
        <Select
          style={{ width: 180 }}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          value={carMark}
          placeholder="Марка"
          onChange={handleChangeMark}
          options={carData.map((item) => ({
            value: item.name,
            label: item.name,
          }))}
        />

        <Select
          style={{ width: 180 }}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          value={carModel}
          disabled={!carMark}
          placeholder="Модель"
          onChange={handleChangeModel}
          options={modelsForSelectedMark.map((item) => ({
            value: item.name,
            label: item.name,
          }))}
        />

        {/*Год выпуска - не является тем значением, от которого зависит цена ОСАГО.  - добавляем просто для наличия */}
        <Input
          style={{ width: 180 }}
          disabled={!carModel}
          value={carRelease}
          placeholder="Год выпуска"
          onChange={handleChangeRelease}
        />
      </div>

      {/* Стоимость ТС - главный фактор в КАСКО. От этого значения не зависит цена ОСАГО. - добавляем просто для наличия */}
      <div className="line upper-middle">
        <Input
          style={{ width: 180 }}
          value={carTechCondition}
          placeholder="Стоимость ТС"
          onChange={handleChangeTechCondition}
        />
      </div>

      <Button
        onClick={handleClickCalc}
        disabled={!carMark || !carModel || !carRelease || !carTechCondition}
        type="primary"
      >
        Рассчитать
      </Button>

      {preliminaryPrice ? (
        <div style={{ margin: "24px 0 24px" }}>
          <div className="line">
            <span>Примерная стоимость ОСАГО:&nbsp;</span>
            <span className="text_semiBold">{preliminaryPrice} ₽</span>
          </div>

          <span>Для точного расчета стоимости заполните </span>
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/anketa")}
          >
            форму ввода данных по полису.
          </span>
        </div>
      ) : (
        <div style={{ margin: "24px 0 24px" }}>
          Здесь вы увидите предварительную цену ОСАГО – укажите данные
          автомобиля для расчета
        </div>
      )}

      <Modal
        title="Данные по полису"
        width={800}
        open={isModalOpen}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
        footer={null}
      >
        <PolicyForm
          initialValues={initialValuesForNewPolicy}
          onSave={() => {
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </Page>
  );
}

export default Home;
