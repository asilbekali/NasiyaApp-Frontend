import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../assets/images";
import Heading from "../../components/Heading";
import Text from "../../components/Text";
import { Button, Input, message } from "antd";
import { LoginIcon, PasswordIcon } from "../../assets/icons";
import { useFormik } from "formik";
import { LoginSchema } from "../../validation/Login";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [isPenning, setPenning] = useState(false);
  const navigate = useNavigate();

  const { values, errors, handleBlur, handleChange, handleSubmit, touched } = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: async (data) => {
      setPenning(true);
      try {
        const response = await axios.post('http://18.159.45.32/seller/login', {
          email: data.username,
          password: data.password
        });

        const statusCode = response.status;

        if (statusCode === 201) {
          const accessToken = response.data.accesToken;

          // Token saqlash
          localStorage.setItem("accessToken", accessToken);
          document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`;

          // ✅ Tasdiqlovchi toast
          message.success("Tizimga muvaffaqiyatli kirdingiz! ✅");

          // /home page ga redirect
          navigate("/home");
        } else if (statusCode >= 200 && statusCode < 300) {
          // Boshqa barcha 2xx kodlar uchun faqat success toast chiqadi, status ko'rsatilmaydi
          message.success("Amal muvaffaqiyatli bajarildi!");
        }

      } catch (error: any) {
        if (error.response) {
          const statusCode = error.response.status;
          if (statusCode === 400) {
            message.error("Login yoki parol noto‘g‘ri!");
          } else if (statusCode === 401) {
            message.error("Ruxsat etilmagan foydalanuvchi!");
          } else if (statusCode === 403) {
            message.error("Tizimga kirish taqiqlangan!");
          } else if (statusCode === 404) {
            message.error("Foydalanuvchi topilmadi!");
          } else if (statusCode >= 500) {
            message.error("Serverda xatolik yuz berdi!");
          } else {
            message.error("Xatolik yuz berdi.");
          }
        } else {
          message.error("Tarmoqda muammo bor yoki server ishlamayapti.");
        }
        console.error('Login failed:', error.response ? error.response.data : error.message);
      } finally {
        setPenning(false);
      }
    }
  });

  return (
    <div className="containers relative !pt-[90px] h-[100vh]">
      <img className="logo-icon mb-[32px]" src={Logo} alt="Logo" width={40} height={40} />
      <Heading tag="h1" classList="!mb-[12px]">Dasturga kirish</Heading>
      <Text>Iltimos, tizimga kirish uchun login va parolingizni kiriting.</Text>
      <form onSubmit={handleSubmit} className="mt-[38px]" autoComplete="off">
        <label>
          <Input
            className={`${errors.username && touched.username ? "!border-red-500 !text-red-500" : ""}`}
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            prefix={<LoginIcon />}
            allowClear
            name="username"
            type="text"
            size="large"
            placeholder="Login"
          />
          {errors.username && touched.username && <span className="text-[13px] text-red-500">{errors.username}</span>}
        </label>
        <label>
          <Input.Password
            className={`${errors.password && touched.password ? "!border-red-500 !text-red-500" : ""} mt-[24px]`}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            prefix={<PasswordIcon />}
            allowClear
            name="password"
            type="password"
            size="large"
            placeholder="Parol"
          />
          {errors.password && touched.password && <span className="text-[13px] text-red-500">{errors.password}</span>}
        </label>
        <Link className="text-[13px] mb-[46px] text-[#3478F7] border-b-[1px] border-[#3478F7] w-[130px] ml-auto block text-end mt-[10px]" to={'#'}>Parolni unutdingizmi?</Link>
        <Button loading={isPenning} htmlType="submit" className={`w-full !h-[45px] !text-[18px] !font-medium ${isPenning ? "cursor-not-allowed" : ""}`} type="primary">Kirish</Button>
      </form>
      <Text classList="absolute bottom-0 !font-normal !pb-[10px]">Hisobingiz yo'q bo'lsa, tizimga kirish huquqini olish uchun <span className="text-[#3478F7]">do'kon administratori</span>  bilan bog'laning.</Text>
    </div>
  )
}

export default Login;
