// Custom Validation Pipe
// Provides enhanced validation with detailed error messages

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Custom Validation Pipe
 * Validates incoming data using class-validator decorators
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Skip validation for primitive types
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform plain object to class instance
    const object = plainToInstance(metatype, value);
    
    // Validate the object using class-validator
    const errors = await validate(object);

    // If validation errors exist, format and throw exception
    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return object;
  }

  /**
   * Check if the metatype should be validated
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * Format validation errors into a readable structure
   */
  private formatErrors(errors: any[]): any {
    const formattedErrors: any = {};

    errors.forEach((error) => {
      const property = error.property;
      const constraints = error.constraints;

      if (constraints) {
        // Get the first constraint message
        formattedErrors[property] = Object.values(constraints)[0];
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        formattedErrors[property] = this.formatErrors(error.children);
      }
    });

    return formattedErrors;
  }
}