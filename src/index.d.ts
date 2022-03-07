// Allow images to be imported
declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.proto' {
  const value: any;
  export = value;
}
