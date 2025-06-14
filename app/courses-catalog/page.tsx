import { CoursesCatalogSection } from '@/components/courses/courses-catalog-section'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export default function CoursesCatalogPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          <div className='text-center space-y-4'>
            <h1 className='text-4xl font-bold'>Khám Phá Khóa Học</h1>
            <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
              Tìm kiếm và khám phá hàng ngàn khóa học chất lượng theo danh mục
              yêu thích của bạn.
            </p>
          </div>
          <CoursesCatalogSection />
        </div>
      </div>
      <Footer />
    </div>
  )
}
