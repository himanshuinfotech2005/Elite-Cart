import Container from "@/components/Container";
import { Title } from "@/components/ui/text";
import { urlFor } from "@/sanity/lib/image";
import { getBlogCategories, getOthersBlog, getSingleBlog } from "@/sanity/queries";
import dayjs from "dayjs";
import { Calendar, ChevronLeftIcon, Pencil } from "lucide-react";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { Blog } from "../../../../../sanity.types";

type SingleBlogPageProps = {
  params: { slug: string };
};

const SingleBlogPage = async ({ params }: SingleBlogPageProps) => {
  const { slug } = params;
  const blog: Blog | null = await getSingleBlog(slug);

  if (!blog) return notFound();

  return (
    <div className="py-10">
      <Container className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="md:col-span-3">
          {blog.mainImage && (
            <Image
              src={urlFor(blog.mainImage).url()}
              alt={blog.title || "Blog Image"}
              width={800}
              height={800}
              className="w-full max-h-[500px] object-cover rounded-lg"
            />
          )}

          <div className="mt-5">
            <div className="text-xs flex items-center gap-5 my-7">
              <div className="flex items-center relative group cursor-pointer">
                {blog.blogcategories?.map((item, index) => (
                  <p
                    key={index}
                    className="font-semibold text-shop_dark_green tracking-wider"
                  >
                    {item?.title || "No Category"}
                  </p>
                ))}
                <span className="absolute left-0 -bottom-1.5 bg-lightColor/30 inline-block w-full h-[2px] group-hover:bg-shop_dark_green hoverEffect" />
              </div>

              <p className="flex items-center gap-1 text-lightColor relative group hover:cursor-pointer hover:text-shop_dark_green hoverEffect">
                <Pencil size={15} /> {blog.author?.name || "Unknown Author"}
                <span className="absolute left-0 -bottom-1.5 bg-lightColor/30 inline-block w-full h-[2px] group-hover:bg-shop_dark_green hoverEffect" />
              </p>

              <p className="flex items-center gap-1 text-lightColor relative group hover:cursor-pointer hover:text-shop_dark_green hoverEffect">
                <Calendar size={15} />{" "}
                {blog.publishedAt
                  ? dayjs(blog.publishedAt).format("MMMM D, YYYY")
                  : "Date Unknown"}
                <span className="absolute left-0 -bottom-1.5 bg-lightColor/30 inline-block w-full h-[2px] group-hover:bg-shop_dark_green hoverEffect" />
              </p>
            </div>

            <h2 className="text-2xl font-bold my-5">{blog.title || "No Title"}</h2>

            {blog.body && (
              <PortableText
                value={blog.body}
                components={{
                  block: {
                    normal: ({ children }) => <p className="my-5 text-base/8">{children}</p>,
                    h2: ({ children }) => (
                      <h2 className="my-5 text-2xl font-medium tracking-tight text-gray-950">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="my-5 text-xl font-medium tracking-tight text-gray-950">
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-5 border-l-2 border-l-gray-300 pl-6 text-base/8 text-gray-950">
                        {children}
                      </blockquote>
                    ),
                  },
                  types: {
                    image: ({ value }) => (
                      <Image
                        alt={value.alt || ""}
                        src={urlFor(value).width(2000).url()}
                        className="w-full rounded-2xl"
                        width={1400}
                        height={1000}
                      />
                    ),
                  },
                  list: {
                    bullet: ({ children }) => (
                      <ul className="list-disc pl-4 text-base/8 marker:text-gray-400">
                        {children}
                      </ul>
                    ),
                    number: ({ children }) => (
                      <ol className="list-decimal pl-4 text-base/8 marker:text-gray-400">
                        {children}
                      </ol>
                    ),
                  },
                  marks: {
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-950">{children}</strong>
                    ),
                    link: ({ value, children }) => (
                      <Link
                        href={value.href}
                        className="font-medium text-gray-950 underline decoration-gray-400 underline-offset-4"
                      >
                        {children}
                      </Link>
                    ),
                  },
                }}
              />
            )}

            <div className="mt-10">
              <Link href="/blog" className="flex items-center gap-1">
                <ChevronLeftIcon className="size-5" />
                <span className="text-sm font-semibold">Back to blog</span>
              </Link>
            </div>
          </div>
        </div>

        <BlogLeft slug={slug} />
      </Container>
    </div>
  );
};

const BlogLeft = async ({ slug }: { slug: string }) => {
  const categories: Array<{ blogcategories?: { title: string }[] }> = await getBlogCategories();
  const blogs: Blog[] = await getOthersBlog(slug, 5);

  return (
    <div>
      <div className="border border-lightColor p-5 rounded-md">
        <Title className="text-base">Blog Categories</Title>
        <div className="space-y-2 mt-2">
          {categories?.map(({ blogcategories }, index) => (
            <div
              key={index}
              className="text-lightColor flex items-center justify-between text-sm font-medium"
            >
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
            <Link
              href={`/blog/${blog.slug?.current || ""}`}
              key={index}
              className="flex items-center gap-2 group"
            >
              {blog.mainImage && (
                <Image
                  src={urlFor(blog.mainImage).url()}
                  alt="blogImage"
                  width={100}
                  height={100}
                  className="w-16 h-16 rounded-full object-cover border-[1px] border-shop_dark_green/10 group-hover:border-shop_dark_green"
                />
              )}
              <p className="line-clamp-2 text-sm text-lightColor group-hover:text-shop_dark_green">
                {blog.title || "No Title"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SingleBlogPage;
