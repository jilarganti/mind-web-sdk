/**
 * CameraFacing enumerates all available facings for {@link Camera cameras}. The facing is a direction which a camera
 * can be pointed to. Most cameras can be pointed to only one direction and, therefore, have only one facing. But front
 * and back cameras on smartphones (and other mobile devices) are usually combined into a single multi-facing camera
 * which is represented with a single instance of {@link Camera} class. The facing of any multi-facing camera can be
 * switched with {@link Camera#setFacing setFacing} method of {@link Camera} class.
 *
 * @readonly
 * @enum {CameraFacing}
 */
const CameraFacing = {

    /**
     * The `USER` facing is used for {@link Camera#setFacing pointing} a multi-facing camera to the user (i.e. for
     * switching to the front camera on a smartphone or other mobile device).
     */
    USER: "user",

    /**
     * The `ENVIRONMENT` facing is used for {@link Camera#setFacing pointing} a multi-facing camera to the environment
     * (i.e. for switching to the back camera on a smartphone or other mobile device).
     */
    ENVIRONMENT: "environment"

};

export { CameraFacing };