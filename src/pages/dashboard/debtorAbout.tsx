import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import { useState } from "react";
import { fetchDebtorById, type Debtor } from "../../service/use-login";

export default function DebtorAbout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isStarred, setIsStarred] = useState(false);

  const { data: debtor, isLoading, isError } = useQuery<Debtor>({
    queryKey: ["debtor", id],
    queryFn: () => fetchDebtorById(Number(id)),
    enabled: !!id,
  });

  const totalDebt =
    debtor?.borrowedProduct.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0
    ) || 0;

  if (isLoading) return <p>Yuklanmoqda...</p>;
  if (isError || !debtor) return <p>Mijoz topilmadi</p>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold">{debtor.name}</h1>
        <button onClick={() => setIsStarred(!isStarred)}>
          <Star
            className={`w-6 h-6 ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
              }`}
          />
        </button>
      </div>

      {/* Mijoz ma’lumotlari */}
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <p><strong>Telefon:</strong> {debtor.debtroPhoneNumber.map(ph => ph.number).join(", ")}</p>
        <p><strong>Manzil:</strong> {debtor.address || "Kiritilmagan"}</p>
        <p><strong>Izoh:</strong> {debtor.note || "Yo‘q"}</p>
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
    </div>
  );
}
