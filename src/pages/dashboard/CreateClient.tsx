import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Upload, Loader2, User, Phone, MapPin, FileText, Camera } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { createClient, uploadImage } from "../../service/use-login";

const CreateClient = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phones, setPhones] = useState([""]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      navigate("/clients");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      if (data?.url) {
        setImages((prev) => [...prev, data.url]);
        setLocalPreviews([]);
      }
    },
  });

  const handleAddPhone = () => setPhones([...phones, ""]);

  const handleRemovePhone = (index: number) =>
    setPhones(phones.filter((_, i) => i !== index));

  const handlePhoneChange = (value: string, index: number) => {
    const updated = [...phones];
    updated[index] = value;
    setPhones(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Create local previews for multiple files
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setLocalPreviews(prev => [...prev, ...newPreviews]);

      // Upload each file to server
      files.forEach(file => {
        uploadMutation.mutate(file);
      });
    }
  };

  const handleSubmit = () => {
    const filteredPhones = phones.filter((p) => p.trim() !== "");
    createMutation.mutate({
      name,
      phoneNumbers: filteredPhones,
      address,
      note,
      images,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg"
          >
            <User className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🧾 Mijoz yaratish
          </h1>
          <p className="text-slate-600 mt-2">Yangi mijoz ma'lumotlarini kiriting</p>
        </motion.div>

        {/* Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm border border-white/20"
        >
          <div className="space-y-6">
            {/* Name */}
            <motion.div variants={itemVariants} className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <User className="w-4 h-4 text-blue-500" />
                Ismi *
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mijoz ismini kiriting"
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-slate-700 placeholder-slate-400 group-hover:border-slate-300"
              />
            </motion.div>

            {/* Phones */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Phone className="w-4 h-4 text-green-500" />
                Telefon raqami *
              </label>
              <AnimatePresence>
                {phones.map((phone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 mb-3 group"
                  >
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value, index)}
                      placeholder="+998 ** *** ** **"
                      className="flex-1 px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-slate-700 placeholder-slate-400 group-hover:border-slate-300"
                    />
                    {phones.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemovePhone(index)}
                        className="p-4 bg-red-100 hover:bg-red-200 rounded-2xl transition-colors duration-300 text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddPhone}
                className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
              >
                <Plus className="w-4 h-4" />
                Ko'proq qo'shish
              </motion.button>
            </motion.div>

            {/* Address */}
            <motion.div variants={itemVariants} className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <MapPin className="w-4 h-4 text-orange-500" />
                Yashash manzili
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Manzilni kiriting"
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-slate-700 placeholder-slate-400 group-hover:border-slate-300"
              />
            </motion.div>

            {/* Note */}
            <motion.div variants={itemVariants} className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <FileText className="w-4 h-4 text-purple-500" />
                Eslatma
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Qo'shimcha eslatma..."
                rows={4}
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-slate-700 placeholder-slate-400 resize-none group-hover:border-slate-300"
              />
            </motion.div>

            {/* Images */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Camera className="w-4 h-4 text-pink-500" />
                Rasm biriktirish
              </label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={handleImageUpload}
              />
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                htmlFor="image-upload"
                className="mt-1 flex items-center gap-3 px-6 py-4 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-all duration-300 w-fit group"
              >
                <Upload className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-slate-700 font-medium">Rasm yuklash</span>
              </motion.label>

              <div className="flex gap-4 mt-4 flex-wrap">
                {/* Local preview while uploading */}
                <AnimatePresence>
                  {localPreviews.map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="w-24 h-24 border-2 border-slate-200 rounded-2xl flex items-center justify-center relative overflow-hidden bg-slate-50"
                    >
                      {uploadMutation.isPending ? (
                        <Loader2 className="animate-spin text-blue-500" size={30} />
                      ) : (
                        <img
                          src={src}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Uploaded images from API */}
                <AnimatePresence>
                  {images.map((url, i) => (
                    <motion.img
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      src={`http://13.233.230.148/${url}`}
                      alt={`uploaded-${i}`}
                      className="w-24 h-24 object-cover rounded-2xl border-2 border-slate-200 hover:border-pink-300 transition-all duration-300 cursor-pointer"
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Save button */}
          <motion.button
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleSubmit}
            disabled={createMutation.isPending || !name.trim()}
            className="mt-8 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl shadow-xl text-lg font-semibold flex justify-center items-center gap-3 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <AnimatePresence mode="wait">
              {createMutation.isPending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Loader2 className="animate-spin" size={20} />
                  Saqlanmoqda...
                </motion.div>
              ) : (
                <motion.div
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <User className="w-5 h-5" />
                  Saqlash
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </motion.div>
    </div>
  );
};

export default CreateClient;
