import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { fetchBorrowedProductById, type BorrowedProduct } from "../../service/use-login";

const BorrowedProductabout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<BorrowedProduct>({
    queryKey: ["borrowedProduct", id],
    queryFn: () => fetchBorrowedProductById(Number(id)),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Xatolik yuz berdi</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Ma'lumot topilmadi</p>
      </div>
    );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-4">{data.productName}</h1>
      </div>

      {/* Debt Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 p-6 rounded-xl shadow mb-6"
      >
        <p className="text-gray-600">Umumiy summa</p>
        <p className="text-2xl font-bold text-blue-700">
          {data.totalAmount.toLocaleString("uz-UZ")} so'm
        </p>
        <p className="mt-2 text-gray-600">Oylik to'lov</p>
        <p className="text-lg font-semibold">
          {data.monthPayment.toLocaleString("uz-UZ")} so'm
        </p>
      </motion.div>

      {/* Details */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <p><b>Muddat:</b> {dayjs(data.term).format("DD.MM.YYYY")}</p>
        <p><b>Yaratilgan sana:</b> {dayjs(data.createAt).format("DD.MM.YYYY HH:mm")}</p>
        <p><b>Izoh:</b> {data.note || "Yo‘q"}</p>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-3">Rasmlar</h2>
        {data.borrowedProductImage?.length ? (
          <div className="flex gap-4 overflow-x-auto">
            {data.borrowedProductImage.map((img) => (
              <img
                key={img.id}
                src={`http://18.159.45.32/${img.image}`}
                alt="Mahsulot rasmi"
                className="w-40 h-40 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Rasm yo'q</p>
        )}
      </div>

      {/* Debtor Info */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Qarz olgan shaxs</h2>
        <p><b>Ism:</b> {data.debtor.name}</p>
        <p><b>Manzil:</b> {data.debtor.address}</p>
        <p><b>Izoh:</b> {data.debtor.note || "Yo‘q"}</p>
      </div>
    </div>
  );
};

export default BorrowedProductabout;
