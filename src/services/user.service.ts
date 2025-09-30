import { UserSchema } from "../models/index";
import {
  decryptSensitiveValue,
  encryptSensitiveValue,
  hashSensitiveValue,
} from "../utils/crypto";

const prepareUserPayload = (props: any) => {
  if (!props) return props;
  const { private_key, ...rest } = props;
  if (typeof private_key === "string" && private_key) {
    return {
      ...rest,
      private_key: encryptSensitiveValue(private_key),
      private_key_hash: hashSensitiveValue(private_key),
    };
  }
  return { ...rest };
};

const decryptUser = (result: any) => {
  if (!result) return result;
  const transform = (entry: any) => {
    if (!entry) return entry;
    const doc = entry.toObject ? entry.toObject() : { ...entry };
    if (typeof doc.private_key === "string" && doc.private_key) {
      try {
        doc.private_key = decryptSensitiveValue(doc.private_key);
      } catch (error) {
        console.error("Failed to decrypt private key", {
          username: doc.username,
          error,
        });
      }
    }
    if ("private_key_hash" in doc) {
      delete doc.private_key_hash;
    }
    return doc;
  };

  return Array.isArray(result) ? result.map(transform) : transform(result);
};

export const UserService = {
  create: async (props: any) => {
    try {
      const payload = prepareUserPayload(props);
      const user = await UserSchema.create(payload);
      return decryptUser(user);
    } catch (err: any) {
      console.log(err);
      throw new Error(err.message);
    }
  },
  findById: async (props: any) => {
    try {
      const { id } = props;
      const result = await UserSchema.findById(id);

      return decryptUser(result);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  findOne: async (props: any) => {
    try {
      const filter = props;
      const result = await UserSchema.findOne({ ...filter, retired: false });

      return decryptUser(result);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  findLastOne: async (props: any) => {
    try {
      const filter = props;
      const result = await UserSchema.findOne(filter).sort({ updatedAt: -1 });

      return decryptUser(result);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  find: async (props: any) => {
    const filter = props;
    try {
      const result = await UserSchema.find(filter);

      return decryptUser(result);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  findAndSort: async (props: any) => {
    const filter = props;
    try {
      const result = await UserSchema.find(filter)
        .sort({ retired: 1, nonce: 1 })
        .exec();

      return decryptUser(result);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  updateOne: async (props: any) => {
    const { id } = props;
    try {
      const payload = prepareUserPayload(props);
      const result = await UserSchema.findByIdAndUpdate(id, payload, {
        new: true,
      });
      return decryptUser(result);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  findAndUpdateOne: async (filter: any, props: any) => {
    try {
      const payload = prepareUserPayload(props);
      const result = await UserSchema.findOneAndUpdate(filter, payload, {
        new: true,
      });
      return decryptUser(result);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  updateMany: async (filter: any, props: any) => {
    try {
      const payload = prepareUserPayload(props);
      const result = await UserSchema.updateMany(filter, {
        $set: payload,
      });
      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  deleteOne: async (props: any) => {
    try {
      const result = await UserSchema.findOneAndDelete(props);
      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  extractUniqueCode: (text: string): string | null => {
    const words = text.split(' ');
    return words.length > 1 ? words[1] : null;
  },

  extractPNLdata: (text: string): any => {
    const words = text.split(' ');
    if(words.length > 1){
      if(words[1].endsWith('png')){
        return words[1].replace('png', '.png');
      }
    }
  }

};
