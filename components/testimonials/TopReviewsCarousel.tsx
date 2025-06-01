import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { reviewService, Review } from "@/app/services/reviewService";
import { Star } from "lucide-react";

export default function TopReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await reviewService.getReviews(0, 10, "star", "DESC");
      setReviews(data.content || []);
    };
    fetchReviews();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={3}
        spaceBetween={32}
        loop={true}
        autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        speed={1200}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="group"
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center h-full transition-transform duration-300 group-hover:scale-105">
              <div className="w-16 h-16 mb-3">
                <img
                  src={review.userAvatar || "/placeholder.svg"}
                  alt={review.userName}
                  className="rounded-full w-16 h-16 object-cover border-2 border-primary shadow"
                />
              </div>
              <div className="font-semibold text-lg text-center mb-1">{review.userName}</div>
              <div className="text-sm text-muted-foreground mb-2 text-center">{review.courseName}</div>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <div className="text-center text-base italic text-gray-700 mb-2 line-clamp-4">"{review.comment}"</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
} 