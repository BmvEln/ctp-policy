import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { calcFinalOsago } from "../../functions/functions.jsx";
import { Button, Input, Radio } from "antd";
import {
  useAddPolicyMutation,
  useUpdatePolicyMutation,
} from "../../../services/policiesApi.js";

function Drivers({ data, handleDeleteDriver, handleDriverChange }) {
  return (
    <div>
      {data.map((item, i) => (
        <div key={item.id}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              className="text_font-12 text_semiBold"
              style={{ marginBottom: "8px" }}
            >
              Водитель {i + 1}
            </div>

            {!i ? null : (
              <Button
                disabled={!i}
                size="small"
                onClick={() => handleDeleteDriver(item.id)}
              >
                Удалить водителя
              </Button>
            )}
          </div>

          <div
            style={{
              display: "flex",
              columnGap: "12px",
              marginBottom: "12px",
            }}
          >
            <Input
              style={{ width: 300 }}
              value={item.fullName}
              onChange={(e) =>
                handleDriverChange(item.id, "fullName", e.target.value)
              }
              placeholder="Фамилия Имя Отчество"
            />

            <Input
              style={{ width: 150 }}
              value={item.birthDate}
              onChange={(e) =>
                handleDriverChange(item.id, "birthDate", e.target.value)
              }
              placeholder="Дата рождения"
            />
          </div>
          <div
            style={{
              display: "flex",
              columnGap: "12px",
              marginBottom: "24px",
            }}
          >
            <Input
              style={{ width: 180 }}
              value={item.experience}
              onChange={(e) =>
                handleDriverChange(item.id, "experience", e.target.value)
              }
              placeholder="Cтаж"
            />

            <Input
              style={{ width: 180 }}
              value={item.licenseNumber}
              onChange={(e) =>
                handleDriverChange(item.id, "licenseNumber", e.target.value)
              }
              placeholder="Cерия и номер ВУ"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Subject({ text, state, setState }) {
  return (
    <div>
      <div className="text_font-14 text_semiBold line">{text}</div>

      <div style={{ marginBottom: "24px" }}>
        <div className="line">
          <Radio.Group
            value={state.type}
            onChange={(e) => setState({ ...state, type: e.target.value })}
            options={[
              { label: "Физическое лицо", value: "fiz" },
              { label: "Юридическое лицо", value: "yur" },
              { label: "Индивидуальный предприниматель (ИП)", value: "ip" },
            ]}
          />
        </div>

        <div
          style={{
            display: "flex",
            columnGap: "12px",
            marginBottom: "12px",
          }}
        >
          <Input
            style={{ width: 300 }}
            value={state.data.fullName}
            onChange={(e) =>
              setState({
                ...state,
                data: {
                  ...state.data,
                  fullName: e.target.value,
                },
              })
            }
            placeholder="Фамилия Имя Отчество"
          />

          <Input
            style={{ width: 150 }}
            value={state.data.birthDate}
            onChange={(e) =>
              setState({
                ...state,
                data: {
                  ...state.data,
                  birthDate: e.target.value,
                },
              })
            }
            placeholder="Дата рождения"
          />
        </div>
      </div>
    </div>
  );
}

export default function PolicyForm({ initialValues, onSave }) {
  const [carMark, setCarMark] = useState("");
  const [carModel, setCarModel] = useState("");
  const [enginePower, setEnginePower] = useState(0);

  const [finalPrice, setFinalPrice] = useState(undefined);
  const [policyHolder, setPolicyHolder] = useState({ type: "fiz", data: {} });
  const [beneficiary, setBeneficiary] = useState({ type: "fiz", data: {} });
  const [drivers, setDrivers] = useState([]);

  const [addPolicy, { isLoading: isAdding }] = useAddPolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();

  useEffect(() => {
    if (initialValues) {
      if (initialValues.id) {
        // РЕЖИМ РЕДАКТИРОВАНИЯ
        const [mark, model] = initialValues.carBrand.split(" / ");
        setCarMark(mark);
        setCarModel(model);

        setEnginePower(initialValues.enginePower || 100);
        setFinalPrice(initialValues.costCTP);
        setPolicyHolder(initialValues.policyHolder);
        setBeneficiary(initialValues.beneficiary);
        setDrivers(initialValues.drivers);
      } else {
        // РЕЖИМ СОЗДАНИЯ
        setCarMark(initialValues.carMark || "");
        setCarModel(initialValues.carModel || "");
        setEnginePower(initialValues.enginePower || 0);
        setFinalPrice(undefined);
        setPolicyHolder({ type: "fiz", data: {} });
        setBeneficiary({ type: "fiz", data: {} });
        setDrivers([
          {
            id: uuidv4(),
            fullName: "",
            birthDate: "",
            experience: "",
            licenseNumber: "",
            kbm: 1.17,
          },
        ]);
      }
    }
  }, [initialValues]);

  const handleAddDriver = () => {
      if (drivers.length < 5) {
        setDrivers([
          ...drivers,
          {
            id: uuidv4(),
            fullName: "",
            birthDate: "",
            experience: "",
            licenseNumber: "",
            kbm: 1.17,
          },
        ]);
      }
    },
    handleDeleteDriver = useCallback(
      (id) => {
        setDrivers(drivers.filter((d) => d.id !== id));
      },
      [drivers],
    ),
    // Функция для обновления поля водителя по его id
    handleDriverChange = useCallback(
      (id, field, value) => {
        setDrivers(
          drivers.map((driver) =>
            driver.id === id ? { ...driver, [field]: value } : driver,
          ),
        );
      },
      [drivers],
    );

  const handleClickCalc = useCallback(() => {
    console.log("Производится перерасчет...");

    const price = calcFinalOsago(enginePower, drivers);

    setFinalPrice(price);
  }, [drivers, enginePower]);

  const handleSave = async () => {
    const isEditing = !!(initialValues && initialValues.id);

    let policyPayload;
    if (isEditing) {
      // РЕЖИМ РЕДАКТИРОВАНИЯ: просто собираем данные
      policyPayload = {
        id: initialValues.id,
        policyNumber: initialValues.policyNumber, // Номер не меняем
        dateCreation: initialValues.dateCreation,
        carBrand: `${carMark} / ${carModel}`,
        costCTP: finalPrice,
        enginePower: enginePower,
        status: "Рассчитан",
        policyHolder,
        beneficiary,
        drivers,
      };
    } else {
      // РЕЖИМ СОЗДАНИЯ
      policyPayload = {
        // id сгенерирует json-server
        policyNumber: Date.now(),
        dateCreation: new Date().toLocaleDateString("ru-RU"),
        carBrand: `${carMark} / ${carModel}`,
        costCTP: finalPrice,
        enginePower: enginePower,
        status: "Рассчитан",
        policyHolder,
        beneficiary,
        drivers,
      };
    }

    try {
      if (isEditing) {
        await updatePolicy({ id: initialValues.id, ...policyPayload }).unwrap();
      } else {
        await addPolicy(policyPayload).unwrap();
      }

      console.log("Данные успешно сохранены!");
      if (onSave) onSave(); // Вызываем колбэк родителя, чтобы закрыть окно
    } catch (error) {
      console.error(
        "Ошибка сохранения: " + (error.data?.message || "Попробуйте снова"),
      );
    }
  };

  return (
    <>
      <Subject
        text="Страхователь"
        state={policyHolder}
        setState={setPolicyHolder}
      />

      <Subject
        text="Выгодоприобретатель"
        state={beneficiary}
        setState={setBeneficiary}
      />

      <div className="text_font-14 text_semiBold line">Водители:</div>

      <Drivers
        data={drivers}
        handleDeleteDriver={handleDeleteDriver}
        handleDriverChange={handleDriverChange}
      />

      <div className="line upper-middle">
        <Button disabled={drivers.length === 5} onClick={handleAddDriver}>
          + Добавить водителя
        </Button>
      </div>

      <div className="line">
        <Button type="primary" onClick={handleClickCalc} style={{ width: 150 }}>
          Сделать перерасчет
        </Button>
      </div>

      <div>
        <Button
          type="primary"
          loading={isAdding || isUpdating}
          onClick={handleSave}
          style={{ width: 150 }}
        >
          Сохранить данные
        </Button>
      </div>

      {!finalPrice ? null : (
        <div style={{ marginTop: "24px" }}>
          <span>Итоговая стоимость ОСАГО:&nbsp;</span>
          <span className="text_semiBold">{finalPrice} ₽</span>
        </div>
      )}
    </>
  );
}
