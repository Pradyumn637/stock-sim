export const safeNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
};
