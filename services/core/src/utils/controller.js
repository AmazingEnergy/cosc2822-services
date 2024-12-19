const { Request, Response, NextFunction } = require("express");

const InvalidConfigError = require("../app/errors/InvalidConfigError");
const DtoType = require("./dtoType");
const BaseDto = require("./baseDto");
const { validateBody, validateQuery, validateParam } = require("./validator");

/**
 * build POST Api
 * @param action
 * @param dtoList
 * @returns a list of validation callbacks and the action at the end.
 * @type {(action: {(req: Request, res: Response, next: NextFunction) => any}, ...dtoList: BaseDto) => Array<{(req: Request, res: Response, next: NextFunction) => any}>}
 */
module.exports.post = (action, ...dtoList) => {
  return build(action, dtoList);
};

/**
 * build PUT Api
 * @param action
 * @param dtoList
 * @returns a list of validation callbacks and the action at the end.
 * @type {(action: {(req: Request, res: Response, next: NextFunction) => any}, ...dtoList: BaseDto) => Array<{(req: Request, res: Response, next: NextFunction) => any}>}
 */
module.exports.put = (action, ...dtoList) => {
  return build(action, dtoList);
};

/**
 * build DELETE Api
 * @param action
 * @param dtoList
 * @returns a list of validation callbacks and the action at the end.
 * @type {(action: {(req: Request, res: Response, next: NextFunction) => any}, ...dtoList: BaseDto) => Array<{(req: Request, res: Response, next: NextFunction) => any}>}
 */
module.exports.delete = (action, ...dtoList) => {
  return build(action, dtoList);
};

/**
 * build GET Api
 * @param action
 * @param dtoList
 * @returns a list of validation callbacks and the action at the end.
 * @type {(action: {(req: Request, res: Response, next: NextFunction) => any}, ...dtoList: BaseDto) => Array<{(req: Request, res: Response, next: NextFunction) => any}>}
 */
module.exports.get = (action, ...dtoList) => {
  return build(action, dtoList);
};

/**
 * @param action
 * @param dtoList
 * @returns
 * @type {(action: {(req: Request, res: Response, next: NextFunction) => any}, dtoList: Array<typeof BaseDto>) => Array<{(req: Request, res: Response, next: NextFunction) => any}>}
 */
const build = (action, dtoList) => {
  if (!dtoList || dtoList.length === 0) return action;
  const callbacks = [];
  for (let dtoType of dtoList) {
    if (!dtoType) continue;
    const dto = new dtoType();
    switch (dto.type) {
      case DtoType.PARAMS:
        callbacks.push(validateParam(dto.validation));
        break;
      case DtoType.QUERY:
        callbacks.push(validateQuery(dto.validation));
        break;
      case DtoType.DTO:
        callbacks.push(validateBody(dto.validation));
        break;
      default:
        throw new InvalidConfigError("DtoType is not support.", {
          type: dto.type,
        });
    }
  }
  callbacks.push(action);
  return callbacks;
};
