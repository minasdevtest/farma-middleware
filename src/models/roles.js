const { isArray } = Array

/**
 * Roles manager
 *
 * @static
 * @export
 * @class Roles
 */
export default class Roles {
    /**
     * Regstered roles
     *
     * @static
     * @memberof Roles
     */
    static roles = {}

    /**
     * Register new Role
     *
     * @static
     * @param {String} name
     * @param {String[]} [permissions=[]]
     * @returns {String[]} registered role
     * @memberof Roles
     */
    static registerRole(name, permissions = []) {
        this.roles[name] = [...permissions].sort()
        return this.roles[name]
    }

    /**
     * Get role
     *
     * @static
     * @param {String} name
     * @returns {Array}
     * @memberof Roles
     */
    static getRole(name) {
        return this.roles[name]
    }

    /**
     * Extend an existing role
     * @param {String|String[]} roles Role or array of roles to extend 
     * @param {String[]} permissions 
     */
    static extendRoles(roles = [], permissions = []) {
        if (typeof roles === 'string')
            roles = [roles]
        const newRole = {};
        roles = [permissions, ...roles.map(role => this.roles[role] || [])]
        roles.forEach(
            permissions => permissions.forEach(
                permission => newRole[permission] = true
            )
        )
        return Object.keys(newRole)
    }

    /**
     * Get permissions combination of an role
     *
     * @static
     * @param {String[]} roles
     * @returns {String[]}
     * @memberof Roles
     */
    static getPermissions(roles) {
        return this.extendRoles(roles)
    }

    /**
     * Get list of roles names
     *
     * @static
     * @returns {String[]}
     * @memberof Roles
     */
    static getRolesList() {
        return Object.keys(this.roles)
    }

    /**
     * Check if the role math permissions
     *
     * @static
     * @param {String[]} permissions
     * @param {String[]} roles
     * @returns {Boolean}
     * @memberof Roles
     */
    static checkPermission(permissions, roles) {
        console.log('Checking permissions', permissions, roles)
        const rolePermissions = this.getPermissions(roles)
        return permissions.every(permission => rolePermissions.indexOf(permission) > -1)
    }
}

// register user role
Roles.registerRole('user', ['read:posts', 'read:location'])

// register admin role
Roles.registerRole('admin', Roles.extendRoles('user', ['write:posts', 'write:location']))
