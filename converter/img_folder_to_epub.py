import os
from ebooklib import epub


def create_epub_book(title):
    book = epub.EpubBook()
    book.set_title(title)
    return book


def add_image_to_book(book, image_path, image_name):
    with open(image_path, "rb") as img_file:
        img_content = img_file.read()
    img_item = epub.EpubImage()
    img_item.file_name = f"images/{image_name}"
    img_item.media_type = "image/" + image_name.split(".")[-1].lower()
    img_item.content = img_content
    book.add_item(img_item)
    return img_item


def create_chapter(image_name):
    html_content = (
        f'<html><body><img src="images/{image_name}" alt="{image_name}"/></body></html>'
    )
    chapter = epub.EpubHtml(
        title=image_name, file_name=f"{image_name}.xhtml", content=html_content
    )
    return chapter


def images_to_epub(images_folder):
    title = os.path.basename(images_folder)
    output_epub = f"{images_folder}.epub"

    book = create_epub_book(title)
    toc = []

    for image_name in sorted(os.listdir(images_folder)):
        valid_image_extensions = (".jpg", ".jpeg", ".png", ".bmp")
        if image_name.lower().endswith(valid_image_extensions):
            image_path = os.path.join(images_folder, image_name)
            add_image_to_book(book, image_path, image_name)
            chapter = create_chapter(image_name)
            book.add_item(chapter)
            toc.append(chapter)
        else:
            print(f"Skipping {image_name} as it is not an image file.")

    book.spine = toc
    book.toc = toc
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    epub.write_epub(output_epub, book)
    print(f"EPUB file created: \n{output_epub}")


if __name__ == "__main__":
    images_folder = input("Enter the path to the folder with images: \n")
    images_to_epub(images_folder)
