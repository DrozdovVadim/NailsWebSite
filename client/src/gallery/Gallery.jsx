import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import generalStyle from "../App.module.css";
import style from "./gallery.module.css";
import axios from "axios";
import { useUser } from "../context/UserContext"; // Импортируем хук

// Динамический импорт всех изображений из папки ../images/gallery/
const images = import.meta.glob("../images/gallery/*.{jpg,jpeg,png,gif}", {
  eager: true,
  import: "default",
});

// Преобразование импортированных изображений в массив объектов
const initialData = Object.keys(images).map((path, index) => ({
  id: index + 1,
  src: images[path],
}));

function Gallery() {
  const { user } = useUser(); // Получаем user из контекста
  const userRole = user ? user.Role : false; // Получаем роль, если пользователь авторизован
  const [data, setData] = useState(initialData); // Состояние для данных галереи
  const [isGridView, setIsGridView] = useState(false); // Состояние для переключения между слайдером и сеткой

useEffect(()=> {
  setData(Object.keys(images).map((path, index) => ({
  id: index + 1,
  src: images[path],
})))
})

  const toggleView = () => {
    setIsGridView(!isGridView); // Переключение режима
  };

  const deletePhoto = async (photoSrc) => {
    // Проверка роли перед удалением
    if (!userRole) {
      alert("У вас нет прав для удаления фотографий.");
      return;
    }

    try {
      const res = await axios.delete("http://localhost:8001/delete-from-gallery", {
        data: { src: photoSrc },
      });
      // После успешного удаления обновляем состояние, удаляя фотографию
      setData(data.filter((item) => item.src !== photoSrc));
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  };

  return (
    <div id="title1" className={`${generalStyle.section} ${style.gallerySection}`}>
      <div className={`${generalStyle.container} ${style.galleryContainer}`}>
        <h2 className={generalStyle.sectionTitle}>Галерея моих работ</h2>
        {isGridView ? (
          <div className={style.gridContainer}>
            {data.map((item) => (
              <div key={item.id} className={userRole && style.gridItem} onClick={() => userRole&& deletePhoto(item.src)}>
                <img
                  src={item.src}
                  className={style.galleryPhoto}
                  alt={`photo-${item.id}`}
                />

              </div>
            ))}
          </div>
        ) : (
          <Swiper
            className={style.imgWrapper}
            modules={[Autoplay]}
            centeredSlides={true}
            breakpoints={{
              0: {
                slidesPerView: 1,
                centeredSlides: true,
              },
              768: {
                slidesPerView: 2,
                centeredSlides: true,
              },
              1000: {
                slidesPerView: 3,
              },
              1400: {
                slidesPerView: 4,
              },
            }}
            spaceBetween={40}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            loop={true}
          >
            {data.map((item) => (
              <SwiperSlide key={item.id} className={style.imgItem}>
                <img
                  src={item.src}
                  className={style.galleryPhoto}
                  alt={`photo-${item.id}`}
                />
                {userRole && (
                  <div
                    onClick={() => deletePhoto(item.src)}
                    className={style.deletePhotoBtn}
                  >
                    удалить
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <a className={style.galleryBtn} onClick={toggleView}>
          {isGridView ? "Свернуть галерею" : "Посмотреть все работы"}
        </a>
        {isGridView && (
          <a
            className={style.closeGridBtn}
            onClick={toggleView}
            aria-label="Свернуть галерею"
          ></a>
        )}
      </div>
    </div>
  );
}

export default Gallery;