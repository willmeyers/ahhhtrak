export const titlize = (value: string) => {
  if (value.length > 0) {
    const retValue = [];
    for (const v of value.split(" ")) {
      if (v.length > 0) {
        retValue.push(v[0].toUpperCase() + v.slice(1, v.length));
      }
    }

    return retValue.join(" ");
  }

  return value;
};
