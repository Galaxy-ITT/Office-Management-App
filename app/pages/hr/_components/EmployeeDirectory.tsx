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
import { 
  fetchEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee,
  fetchDepartments,
  Employee,
  Department
} from './_queries';

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Fetch employees and departments data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const employeesResult = await fetchEmployees();
        if (employeesResult.success && employeesResult.data) {
          setEmployees(employeesResult.data);
        } else {
          message.error('Failed to load employees');
        }

        // Fetch departments
        const departmentsResult = await fetchDepartments();
        if (departmentsResult.success && departmentsResult.data) {
          setDepartments(departmentsResult.data);
        } else {
          message.error('Failed to load departments');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        message.error('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      filters: departments.map(dept => ({ text: dept.name, value: dept.name })),
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
      val?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    form.setFieldsValue({
      position: 'Staff',
      status: 'active'
    });
    setIsModalVisible(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      name: employee.name,
      position: employee.position,
      department_id: employee.department_id,
      email: employee.email,
      phone: employee.phone,
      status: employee.status
    });
    setIsModalVisible(true);
  };

  const handleDelete = (employee: Employee) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this employee?',
      content: `This will remove ${employee.name} from the directory.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const result = await deleteEmployee(employee.employee_id);
          if (result.success) {
            setEmployees(employees.filter((e) => e.employee_id !== employee.employee_id));
            message.success('Employee deleted successfully');
          } else {
            message.error(result.error || 'Failed to delete employee');
          }
        } catch (error) {
          console.error('Error deleting employee:', error);
          message.error('An error occurred while deleting employee');
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Get current admin info (this would come from your auth context)
      const currentAdmin = {
        admin_id: 1, // Replace with actual admin ID from context
      };
      
      if (editingEmployee) {
        // Update existing employee
        const result = await updateEmployee(editingEmployee.employee_id, {
          ...values,
          created_by: currentAdmin.admin_id,
        });
        
        if (result.success) {
          // Refresh employee list
          const updatedEmployees = await fetchEmployees();
          if (updatedEmployees.success && updatedEmployees.data) {
            setEmployees(updatedEmployees.data);
          }
          message.success('Employee updated successfully');
        } else {
          message.error(result.error || 'Failed to update employee');
        }
      } else {
        // Add new employee
        const result = await addEmployee({
          ...values,
          created_by: currentAdmin.admin_id,
        });
        
        if (result.success) {
          // Refresh employee list
          const updatedEmployees = await fetchEmployees();
          if (updatedEmployees.success && updatedEmployees.data) {
            setEmployees(updatedEmployees.data);
          }
          message.success('Employee added successfully');
        } else {
          message.error(result.error || 'Failed to add employee');
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
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
        rowKey="employee_id"
        pagination={{ pageSize: 10 }}
        loading={loading}
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
            initialValue="Staff"
            rules={[{ required: true, message: 'Please enter position' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department_id"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select>
              {departments.map(dept => (
                <Select.Option key={dept.department_id} value={dept.department_id}>
                  {dept.name}
                </Select.Option>
              ))}
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
          <Form.Item
            name="status"
            label="Status"
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeDirectory;
