import { Media } from "@model/Media";

export const toMedia = ({ value, obj }) => {
  if (Array.isArray(value)) {
    value = value.map((item: Media) => {
      item.url = item.url.replace("_3x_", Media.dpi);
      return item;
    });
  } else {
    (value as Media).url = value.url.replace("_3x_", Media.dpi)
  }
  return value;
}