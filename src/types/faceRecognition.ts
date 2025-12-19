export interface IFaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
};
export interface ICheckFaceResponse {
  has_face: boolean;
  count: number;
  boxes: IFaceBox[];
};
export interface ICheckFaceRequest {
  image: File;
};