import Hero from "@/components/Hero";
import HomeHotels from "@/components/HomeHotels";
import HomeBrands from "@/components/HomeBrands";

export default function HomePage() {
  return (
    <>
      {/* Hero：全宽底图 + 左上搜索卡，切 Tab 换底图 */}
      <Hero />

      <div className="mx-auto max-w-6xl px-6">
        {/* 中间：热门城市酒店（默认按定位城市，含周边城市切换） */}
        <HomeHotels />

        {/* 底部：优质酒店品牌 */}
        <HomeBrands />
      </div>
    </>
  );
}
