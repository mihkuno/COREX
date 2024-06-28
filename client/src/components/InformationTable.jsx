import React from 'react';
import { Table, Space } from 'antd'; // Import Space from Ant Design

function InformationTable({ student }) {
    // Define columns for the table
    const columns = [
      {
        title: 'Field',
        dataIndex: 'field',
        key: 'field',
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
      },
    ];
  
    // Prepare data in required format for Ant Design Table
    const data = [
      { key: '1', field: 'Student ID', value: student.student_id },
      { key: '2', field: 'First Name', value: student.first_name },
      { key: '3', field: 'Last Name', value: student.last_name },
      { key: '4', field: 'Year Level', value: student.year_level },
      { key: '5', field: 'Age', value: student.age },
      { key: '6', field: 'Contact', value: student.contact_no },
      { key: '7', field: 'Department', value: student.department },
      { key: '8', field: 'Curriculum', value: student.curriculum}
      // Add more fields as needed
    ];
  
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Space>
    );
}

export default InformationTable;
