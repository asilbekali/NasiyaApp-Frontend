import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Empty,
  List,
  Typography,
  Space,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { instance } from "../../hooks/instance";

interface Sample {
  id: number;
  message: string;
}

const { Title, Text } = Typography;

const API_URL = "/message-sample";

const MessageSample: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [newText, setNewText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSample, setEditingSample] = useState<Sample | null>(null);
  const navigate = useNavigate();

  // Fetch all samples
  const fetchSamples = async () => {
    try {
      const res = await instance().get(API_URL);
      setSamples(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  // Add new sample
  const handleAdd = async () => {
    if (newText.trim()) {
      try {
        const res = await instance().post(API_URL, { message: newText });
        setSamples([...samples, res.data]);
        setNewText("");
        setShowForm(false);
      } catch (err) {
        console.error("Create error:", err);
      }
    }
  };

  // Delete sample
  const handleDelete = async (id: number) => {
    try {
      await instance().delete(`${API_URL}/${id}`);
      setSamples(samples.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Update sample
  const handleUpdate = async () => {
    if (editingSample && newText.trim()) {
      try {
        const res = await instance().patch(`${API_URL}/${editingSample.id}`, {
          message: newText,
        });
        setSamples(
          samples.map((s) =>
            s.id === editingSample.id ? { ...s, message: res.data.message } : s
          )
        );
        setEditingSample(null);
        setNewText("");
        setShowForm(false);
      } catch (err) {
        console.error("Update error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg" bodyStyle={{ padding: "16px" }}>
          {/* Header */}
          <Space align="center" className="mb-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/reports")}
              className="hover:scale-110 transition-transform"
            />
            <Title level={4} style={{ margin: 0 }}>
              Namuna yaratish
            </Title>
          </Space>

          {/* Empty State */}
          <AnimatePresence>
            {samples.length === 0 && !showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Empty
                  description={
                    <>
                      <Text strong>Mavjud namunalr yo‘q</Text>
                      <br />
                      <Text type="secondary">
                        “Qo‘shish” tugmasi orqali namuna yarating
                      </Text>
                    </>
                  }
                  className="py-12"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Samples List */}
          <AnimatePresence>
            {samples.length > 0 && !showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <List
                  dataSource={samples}
                  renderItem={(sample) => (
                    <motion.div
                      key={sample.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <List.Item
                        className="rounded-lg shadow-sm hover:shadow-md hover:bg-gray-100 transition cursor-pointer"
                        actions={[
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setEditingSample(sample);
                              setNewText(sample.message);
                              setShowForm(true);
                            }}
                            key="edit"
                          />,
                          <Popconfirm
                            title="O‘chirishni tasdiqlaysizmi?"
                            onConfirm={() => handleDelete(sample.id)}
                            okText="Ha"
                            cancelText="Yo‘q"
                            key="delete"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              className="hover:scale-110 transition-transform"
                            />
                          </Popconfirm>,
                        ]}
                      >
                        <Text>{sample.message}</Text>
                      </List.Item>
                    </motion.div>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <Text strong>Namuna</Text>
                <Input.TextArea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Matn yozish..."
                  rows={4}
                  className="mt-2"
                />
                <Button
                  type="primary"
                  block
                  className="mt-3 rounded-lg hover:scale-105 transition-transform"
                  onClick={editingSample ? handleUpdate : handleAdd}
                >
                  {editingSample ? "Yangilash" : "Yaratish"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Button */}
          {!showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button
                type="primary"
                block
                className="mt-6 rounded-lg hover:scale-105 transition-transform"
                icon={<PlusOutlined />}
                onClick={() => setShowForm(true)}
              >
                Qo‘shish
              </Button>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default MessageSample;
