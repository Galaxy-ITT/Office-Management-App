import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  Select,
  message,
} from 'antd';
import { SearchOutlined, UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Simulated data - replace with actual API fetch
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'John Doe',
        position: 'Software Engineer',
        department: 'Engineering',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        status: 'active',
      },
      // Add more mock data as needed
    ];
    setEmployees(mockEmployees);
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'Engineering', value: 'Engineering' },
        { text: 'HR', value: 'HR' },
        { text: 'Sales', value: 'Sales' },
      ],
      onFilter: (value: boolean | React.Key, record: Employee) => record.department === value.toString(),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'active' ? 'green' : 'red' }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredEmployees = employees.filter((employee) =>
    Object.values(employee).some((val) =>
      val.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue(employee);
    setIsModalVisible(true);
  };

  const handleDelete = (employee: Employee) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this employee?',
      content: `This will remove ${employee.name} from the directory.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // Implement delete logic here
        setEmployees(employees.filter((e) => e.id !== employee.id));
        message.success('Employee deleted successfully');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingEmployee) {
        // Update existing employee
        setEmployees(
          employees.map((emp) =>
            emp.id === editingEmployee.id ? { ...emp, ...values } : emp
          )
        );
        message.success('Employee updated successfully');
      } else {
        // Add new employee
        const newEmployee = {
          ...values,
          id: Date.now().toString(), // Generate a temporary ID
          status: 'active',
        };
        setEmployees([...employees, newEmployee]);
        message.success('Employee added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="Search employees..."
          prefix={<SearchOutlined />}
          style={{ width: '300px' }}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAdd}
        >
          Add Employee
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredEmployees}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter employee name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: 'Please enter position' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select>
              <Select.Option value="Engineering">Engineering</Select.Option>
              <Select.Option value="HR">HR</Select.Option>
              <Select.Option value="Sales">Sales</Select.Option>
              <Select.Option value="Marketing">Marketing</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeDirectory;
