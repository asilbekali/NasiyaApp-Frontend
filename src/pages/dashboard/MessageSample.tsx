import React, { useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ qo‘shildi

interface Sample {
  id: number;
  text: string;
}

const MessageSample = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [newText, setNewText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate(); // ✅ navigate hook

  const handleAdd = () => {
    if (newText.trim()) {
      setSamples([...samples, { id: Date.now(), text: newText }]);
      setNewText("");
      setShowForm(false);
    }
  };

  const handleDelete = (id: number) => {
    setSamples(samples.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-4">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            className="text-gray-600"
            onClick={() => navigate("/reports")} // ✅ back bosilganda yo‘naltirish
          >
            ⬅
          </button>
          <h1 className="text-lg font-semibold">Namuna yaratish</h1>
        </div>

        {/* Samples */}
        {samples.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 py-20">
            <p className="mb-2">Mavjud namunalr yo‘q</p>
            <p className="text-sm">“Qo‘shish” tugmasi orqali namuna yarating</p>
          </div>
        )}

        {samples.length > 0 && !showForm && (
          <div className="space-y-3">
            {samples.map((sample) => (
              <div
                key={sample.id}
                className="relative p-3 rounded-xl border bg-gray-50"
              >
                <p className="text-sm text-gray-700">{sample.text}</p>
                <button
                  onClick={() => handleDelete(sample.id)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Namuna</label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Matn yozish..."
              className="w-full p-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
            />
            <button
              onClick={handleAdd}
              className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition"
            >
              Yaratish
            </button>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 w-full flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition"
          >
            <Plus size={18} />
            <span>Qo‘shish</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageSample;
