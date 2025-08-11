import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../../service/use-login";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: clients = [], isLoading, isError } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const filteredClients = clients.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <p className="p-4 animate-pulse">Yuklanmoqda...</p>;
  }

  if (isError) {
    return <p className="p-4 text-red-500">Xatolik yuz berdi</p>;
  }

  return (
    <div className="p-4 pb-24 bg-gray-50 min-h-screen">
      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-4"
      >
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Mijozlarni qidiring..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border pl-10 pr-4 py-2 outline-none focus:ring focus:ring-blue-200 shadow-sm"
        />
      </motion.div>

      {/* Clients list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredClients.map((client: any, index: number) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/debtor/${client.id}`)} // ✅ DebtorDetail sahifasiga o'tish
            >
              <p className="font-semibold text-lg">{client.name}</p>
              <p className="text-gray-500 text-sm">
                {client.debtroPhoneNumber?.[0]?.number || "Telefon yo'q"}
              </p>
              <p className="text-red-500 font-semibold mt-1">
                {client.borrowedProduct
                  .reduce(
                    (sum: number, p: any) => sum + (p.totalAmount || 0),
                    0
                  )
                  .toLocaleString("uz-UZ")}{" "}
                so‘m
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/createClient")}
        className="fixed bottom-20 right-5 bg-blue-500 text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-lg z-[60]"
      >
        <Plus size={20} /> Yaratish
      </motion.button>
    </div>
  );
};

export default Clients;
