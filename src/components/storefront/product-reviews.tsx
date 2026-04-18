import { getProductReviews, getProductRating } from "@/lib/reviews";
import { StarRating } from "./star-rating";

export function ProductReviews({
  productId,
  category,
  price,
}: {
  productId: string;
  category: string;
  price: number;
}) {
  const { rating, count } = getProductRating(productId, price);
  const reviews = getProductReviews(productId, category, 4);

  return (
    <div className="border-t border-[#E8E8E8] pt-8 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[18px] font-bold text-[#062F35]">
          Vlerësimet e klientëve
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-bold text-[#062F35]">{rating}</span>
          <StarRating rating={rating} count={count} size="md" />
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-[#FAFAFA] rounded-[10px] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-[28px] h-[28px] rounded-full bg-[#062F35] flex items-center justify-center text-white text-[10px] font-bold">
                  {review.name.charAt(0)}
                </div>
                <span className="text-[13px] font-bold text-[#062F35]">
                  {review.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] rounded-[3px] font-semibold">
                  Blerës i verifikuar
                </span>
              </div>
              <span className="text-[11px] text-[rgba(18,18,18,0.35)]">
                {review.date}
              </span>
            </div>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill={star <= review.rating ? "#FBBF24" : "#E5E7EB"}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-[13px] text-[rgba(18,18,18,0.65)] leading-relaxed">
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
