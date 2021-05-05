import { AnyAbility, subject } from "@casl/ability";
import { HookContext } from "@feathersjs/feathers";
import { getItems } from "feathers-hooks-common";
import { CheckBasicPermissionHookOptions, HookBaseOptions } from "../types";
import { throwUnlessCan } from "./authorize/authorize.hook.utils";

const defaultOptions: HookBaseOptions = {
  ability: undefined,
  actionOnForbidden: undefined,
  checkMultiActions: false,
  checkAbilityForInternal: false,
  modelName: (context: Pick<HookContext, "path">): string => {
    return context.path;
  },
  notSkippable: false
};

export const makeDefaultBaseOptions = (): HookBaseOptions => {
  return Object.assign({}, defaultOptions);
};

export const checkCreatePerItem = (
  context: HookContext,
  ability: AnyAbility,
  modelName: string,
  options: Pick<HookBaseOptions, "actionOnForbidden"> & Partial<Pick<CheckBasicPermissionHookOptions, "checkCreateForData">>
): HookContext => {
  const { method } = context;
  if (method !== "create" || !options.checkCreateForData) {
    return context; 
  }
  
  const checkCreateForData = (typeof options.checkCreateForData === "function") 
    ? options.checkCreateForData(context)
    : true;

  if (!checkCreateForData) { return context; }

  // we have all information we need (maybe we need populated data?)
  let items = getItems(context);
  items = (Array.isArray(items)) ? items : [items];

  for (let i = 0, n = items.length; i < n; i++) {
    throwUnlessCan(
      ability,
      method,
      subject(modelName, items[i]),
      modelName,
      options
    );
  }

  return context;
};