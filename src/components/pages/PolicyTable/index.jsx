import React, { useCallback, useRef, useState } from "react";

import "./style.less";

import {
  useGetPoliciesQuery,
  useGetPolicyByIdQuery,
} from "../../../services/policiesApi.js";

import Page from "../../layout/Page/index.jsx";
import { Button, Input, Modal, Space, Table } from "antd";
import PolicyForm from "../../blocks/PolicyForm/index.jsx";

function EditPolicyModal({ visible, policyId, onClose, onSave }) {
  const {
    data: policyData,
    isLoading,
    isError,
  } = useGetPolicyByIdQuery(policyId, {
    skip: !policyId,
  });

  if (!policyData || isError) {
    console.error("Не удалось загрузить данные полиса");
    return null;
  }

  return (
    <Modal
      title="Редактирование полиса"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>Загрузка...</div>
      ) : (
        <PolicyForm initialValues={policyData} onSave={onSave} />
      )}
    </Modal>
  );
}

function PolicyTable() {
  const { data: policies, error, isLoading } = useGetPoliciesQuery();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);

  const searchInput = useRef(null);

  const handleSearch = useCallback((selectedKeys, confirm) => {
      confirm();
    }, []),
    handleReset = useCallback((clearFilters) => {
      clearFilters();
    }, []);

  const handleEdit = (policyId) => {
    setEditingPolicyId(policyId);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingPolicyId(null);
  };

  const handleModalSave = () => {
    handleModalClose();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    // filterIcon: (filtered) => (
    //   <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    // ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const columns = [
    {
      title: "Номер полиса",
      dataIndex: "policyNumber",
      ...getColumnSearchProps("policyNumber"),
    },
    {
      title: "Дата создания",
      dataIndex: "dateCreation",
      ...getColumnSearchProps("dateCreation"),
    },
    {
      title: "Марка / Модель",
      dataIndex: "carBrand",
      ...getColumnSearchProps("carBrand"),
    },
    {
      title: "Стоимость ОСАГО",
      dataIndex: "costCTP",
      ...getColumnSearchProps("costCTP"),
    },
    {
      title: "Статус",
      dataIndex: "status",
      ...getColumnSearchProps("status"),
    },
    {
      title: "Редактирование",
      dataIndex: "edit",
      render: (_, record) => (
        <Button onClick={() => handleEdit(record.id)}>Редактировать</Button>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  if (!policies || error) {
    console.error("Ошибка при загрузке полисов");
    return null;
  }

  return (
    <Page className="PolicyTable">
      <Table
        dataSource={policies?.slice().reverse()}
        columns={columns}
        onChange={onChange}
        loading={isLoading}
      />

      <EditPolicyModal
        visible={isModalVisible}
        policyId={editingPolicyId}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </Page>
  );
}

export default PolicyTable;
