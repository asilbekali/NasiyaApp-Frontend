import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, X, Plus } from "lucide-react";
import { fetchDebtorById, type Debtor } from "../../service/use-login";
import { instance } from "../../hooks/instance";
import { useState } from "react";

export default function DebtorAbout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debtor ma'lumotini olish
  const { data: debtor, isLoading, isError } = useQuery<Debtor>({
    queryKey: ["debtor", id],
    queryFn: () => fetchDebtorById(Number(id)),
    enabled: !!id,
  });

  // Debtorni o'chirish mutatsiyasi
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID topilmadi");
      const api = instance();
      return await api.delete(`/debtor/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtor"] });
      navigate(-1);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setIsModalOpen(false);
  };

  const totalDebt =
    debtor?.borrowedProduct.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0
    ) || 0;

  if (isLoading) return <p>Yuklanmoqda...</p>;
  if (isError || !debtor) return <p>Mijoz topilmadi</p>;

  return (
    <div className="p-4 relative min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold">{debtor.name}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-red-500 hover:text-red-700"
          title="O‘chirish"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {/* Mijoz ma’lumotlari */}
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <p>
          <strong>Telefon:</strong>{" "}
          {debtor.debtroPhoneNumber.map((ph) => ph.number).join(", ")}
        </p>
        <p>
          <strong>Manzil:</strong> {debtor.address || "Kiritilmagan"}
        </p>
        <p>
          <strong>Izoh:</strong> {debtor.note || "Yo‘q"}
        </p>

        {/* Rasm(lar) */}
        {debtor.debtor_image.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {debtor.debtor_image.map((img) => (
              <img
                key={img.id}
                src={img.image}
                alt={`Debtor image ${img.id}`}
                className="w-24 h-24 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}
      </div>

      {/* Umumiy qarz */}
      <div className="bg-blue-100 p-4 rounded-lg mb-6">
        <p>Umumiy nasiya</p>
        <p className="text-xl font-bold">
          {totalDebt.toLocaleString("uz-UZ")} so'm
        </p>
      </div>

      {/* Nasiyalar ro‘yxati */}
      <h2 className="font-semibold mb-3">Faol nasiyalar</h2>
      <div className="space-y-3">
        {debtor.borrowedProduct.length > 0 ? (
          debtor.borrowedProduct.map((loan) => {
            const termDate = new Date(loan.term);
            const createDate = new Date(loan.createAt);

            return (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow rounded-xl p-4 cursor-pointer"
                onClick={() => navigate(`/borrowed-product/${loan.id}`)}
              >
                <div className="flex justify-between mb-2">
                  <span>
                    {createDate.toLocaleDateString("uz-UZ")}{" "}
                    {createDate.toLocaleTimeString("uz-UZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {loan.totalAmount.toLocaleString("uz-UZ")} so'm
                  </span>
                </div>
                <p>Keyingi to‘lov: {termDate.toLocaleDateString("uz-UZ")}</p>
                <p>{loan.monthPayment.toLocaleString("uz-UZ")} so'm</p>
              </motion.div>
            );
          })
        ) : (
          <p>Faol nasiya yo‘q</p>
        )}
      </div>

      {/* Pastki "Nasiya yaratish" tugmasi */}
      <button
        onClick={() => navigate(`/borrowed-product/create?debtorId=${debtor.id}`)}
        className="fixed left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition"
        style={{ bottom: "80px" }} // Menu balandligi + oraliq
      >
        <Plus className="w-5 h-5" />
        Nasiya yaratish
      </button>

      {/* Delete modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 shadow-lg w-80"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">O‘chirish</h2>
                <button onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mb-6">
                Bu mijoz va unga tegishli barcha ma’lumotlarni o‘chirishni
                xohlaysizmi?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Yo‘q
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Ha
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
