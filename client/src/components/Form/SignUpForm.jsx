import React from 'react';
import MapSearch from '../Map/MapSearch';

const UserProfileForm = props => {
  const handleFormSubmission = event => {
    event.preventDefault();
    props.onFormSubmission();
  };

  const handleValueChange = event => {
    const name = event.target.name;
    const value = event.target.value;
    props.onValueChange(name, value);
  };

  const handleAvatarInputChange = event => {
    const file = event.target.files[0];
    props.onAvatarChange(file);
  };

  return (
    <form onSubmit={handleFormSubmission}>
      <label htmlFor='input-avatar' className='avatar-label'>
        <div className='image-cropper'>
          <img src={props.avatarPreview} alt='' className='profile-pic' />
        </div>
        <input
          style={{ display: 'none' }}
          id='input-avatar'
          type='file'
          name='avatar'
          onChange={handleAvatarInputChange}
        />
      </label>
      <div className='input-group'>
        <label htmlFor='input-name'>FullName</label>
        <input
          id='input-name'
          type='text'
          name='name'
          placeholder='Enter Full Name'
          value={props.name}
          onChange={handleValueChange}
        />
      </div>
      <div className='input-group'>
        <label htmlFor='input-username'>Username</label>
        <input
          id='input-username'
          type='text'
          name='username'
          placeholder='Enter a Username'
          value={props.username}
          onChange={handleValueChange}
        />
      </div>
      <div className='input-group'>
        <label htmlFor='input-email'>Email</label>
        <input
          id='input-email'
          type='email'
          name='email'
          placeholder='Email'
          value={props.email}
          onChange={handleValueChange}
        />
      </div>

      <div className='input-group'>
        <label htmlFor='input-password'>Password</label>
        <input
          minLength='8'
          id='input-password'
          type='password'
          name='password'
          placeholder='Password'
          value={props.password}
          onChange={handleValueChange}
        />
      </div>

      <div className='map-input'>
        <p>Find Location on Map </p>
        <MapSearch
          height={'20vh'}
          resultInfoHandler={(name, value) => props.onValueChange(name, value)}
          center={props.location}
        />
      </div>

      <button> {props.isEdit ? 'Edit Profile' : 'Sign Up'} </button>
    </form>
  );
};

export default UserProfileForm;
