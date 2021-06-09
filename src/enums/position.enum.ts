export enum Position {
    centre = "centre",
    top = "top",
    right_top = "right top",
    right = "right",
    right_bottom = "right bottom",
    bottom = "bottom",
    left_bottom = "left bottom",
    left = "left",
    left_top = "left top",
    attention = "attention", // focus on the region with the highest luminance frequency, colour saturation and presence of skin tones.
    entropy = "entropy" // focus on the region with the highest Shannon entropy

}