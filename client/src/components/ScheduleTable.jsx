import React from 'react';
import { Table } from 'antd';

const ScheduleTable = ({ scheduleData }) => {
  const columns = [
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
    },
    {
      title: 'Course Code',
      dataIndex: ['Course', 'course_code'],
      key: 'course_code',
    },
    {
      title: 'Course Name',
      dataIndex: ['Course', 'course_name'],
      key: 'course_name',
    },
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
    },
    {
      title: 'Instructor',
      dataIndex: ['Instructor', 'first_name'],
      key: 'instructor',
      render: (text, record) => `${record.Instructor.first_name} ${record.Instructor.last_name}`,
    },
    {
      title: 'Classroom',
      dataIndex: ['Classroom', 'room_no'],
      key: 'classroom',
      render: (text, record) => {
        const { building_no, floor_no, room_no } = record.Classroom;
        return `${building_no ? `Building ${building_no}, ` : ''}${floor_no ? `Floor ${floor_no}, ` : ''}${room_no ? `Room ${room_no}` : ''}`;
      },
    },
  ];

  return <Table dataSource={scheduleData} columns={columns} />;
};

export default ScheduleTable;
