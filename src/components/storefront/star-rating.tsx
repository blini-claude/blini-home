export function StarRating({
  rating,
  count,
  size = "sm",
}: {
  rating: number;
  count: number;
  size?: "sm" | "md";
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const starSize = size === "sm" ? 12 : 16;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            fill={
              star <= fullStars
                ? "#FBBF24"
                : star === fullStars + 1 && hasHalf
                  ? "url(#half)"
                  : "#E5E7EB"
            }
          >
            {star === fullStars + 1 && hasHalf && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="50%" stopColor="#E5E7EB" />
                </linearGradient>
              </defs>
            )}
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span
        className={`font-semibold text-[rgba(18,18,18,0.45)] ${
          size === "sm" ? "text-[10px]" : "text-[13px]"
        }`}
      >
        ({count})
      </span>
    </div>
  );
}
