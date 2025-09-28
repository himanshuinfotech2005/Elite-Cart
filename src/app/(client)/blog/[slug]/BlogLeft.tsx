import { Title } from "@/components/ui/text";
import { getBlogCategories, getOthersBlog } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import Image from "next/image";

const BlogLeft = async ({ slug }: { slug: string }) => {
  const categories: Array<{ blogcategories?: { title: string }[] }> = await getBlogCategories();
  const blogs: any[] = await getOthersBlog(slug, 5);

  return (
    <div>
      <div className="border border-lightColor p-5 rounded-md">
        <Title className="text-base">Blog Categories</Title>
        <div className="space-y-2 mt-2">
          {categories?.map(({ blogcategories }, index) => (
            <div key={index} className="text-lightColor flex items-center justify-between text-sm font-medium">
              <p>{blogcategories?.[0]?.title || "No Category"}</p>
              <p className="text-darkColor font-semibold">{`(1)`}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-lightColor p-5 rounded-md mt-10">
        <Title className="text-base">Latest Blogs</Title>
        <div className="space-y-4 mt-4">
          {blogs?.map((blog, index) => (
            <Link href={`/blog/${blog.slug?.current || ""}`} key={index} className="flex items-center gap-2 group">
              {blog.mainImage && (
                <Image
                  src={urlFor(blog.mainImage).url()}
                  alt="blogImage"
                  width={100}
                  height={100}
                  className="w-16 h-16 rounded-full object-cover border-[1px] border-shop_dark_green/10 group-hover:border-shop_dark_green"
                />
              )}
              <p className="line-clamp-2 text-sm text-lightColor group-hover:text-shop_dark_green">{blog.title || "No Title"}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogLeft;